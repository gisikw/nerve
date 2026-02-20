// Minimal markdown-to-HTML renderer for chat messages.
// Port of Markdown.elm — supports bold, italic, inline code,
// fenced code blocks, blockquotes, and links.

export function renderMarkdown(input: string): string {
  const lines = input.split("\n");
  return renderLines(lines);
}

function renderLines(lines: string[]): string {
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      // Fenced code block
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        `<pre class="code-block"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
    } else if (line.startsWith("> ") || line === ">") {
      // Blockquote
      const quoteLines: string[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("> ") || lines[i] === ">")
      ) {
        quoteLines.push(
          lines[i] === ">" ? "" : lines[i].slice(2),
        );
        i++;
      }
      const inner = quoteLines
        .map((ql) => `<p>${renderInline(ql)}</p>`)
        .join("");
      blocks.push(`<blockquote class="blockquote">${inner}</blockquote>`);
    } else {
      blocks.push(renderInline(line));
      i++;
    }
  }

  // Join inline content with <br>, but don't add <br> adjacent to
  // block-level elements (pre, blockquote) — they handle their own spacing.
  let html = "";
  for (let j = 0; j < blocks.length; j++) {
    if (j > 0) {
      const prev = blocks[j - 1];
      const curr = blocks[j];
      const prevIsBlock = prev.startsWith("<pre") || prev.startsWith("<blockquote");
      const currIsBlock = curr.startsWith("<pre") || curr.startsWith("<blockquote");
      if (!prevIsBlock && !currIsBlock) {
        html += "<br>";
      }
    }
    html += blocks[j];
  }
  return html;
}

interface Match {
  before: string;
  inner: string;
  after: string;
  type: "bold" | "italic" | "code" | "link";
  url?: string;
}

function renderInline(input: string): string {
  let result = "";
  let remaining = input;

  while (remaining.length > 0) {
    const match = findNextMarker(remaining);
    if (!match) {
      result += escapeHtml(remaining);
      break;
    }

    result += escapeHtml(match.before);

    switch (match.type) {
      case "bold":
        result += `<strong>${escapeHtml(match.inner)}</strong>`;
        break;
      case "italic":
        result += `<em>${escapeHtml(match.inner)}</em>`;
        break;
      case "code":
        result += `<code class="inline-code">${escapeHtml(match.inner)}</code>`;
        break;
      case "link":
        result += `<a href="${escapeAttr(match.url!)}" target="_blank" rel="noopener">${escapeHtml(match.inner)}</a>`;
        break;
    }

    remaining = match.after;
  }

  return result;
}

function findNextMarker(input: string): Match | null {
  const candidates: Match[] = [];

  // Bold **...**
  const bold = findPattern(input, "**", "**", "bold");
  if (bold) candidates.push(bold);

  // Italic *...*
  const italic = findPattern(input, "*", "*", "italic");
  if (italic) candidates.push(italic);

  // Inline code `...`
  const code = findPattern(input, "`", "`", "code");
  if (code) candidates.push(code);

  // Link [text](url)
  const link = findLink(input);
  if (link) candidates.push(link);

  if (candidates.length === 0) return null;

  // Pick the one with the shortest "before" (earliest in the string)
  candidates.sort((a, b) => a.before.length - b.before.length);
  return candidates[0];
}

function findPattern(
  input: string,
  open: string,
  close: string,
  type: Match["type"],
): Match | null {
  const startIdx = input.indexOf(open);
  if (startIdx === -1) return null;

  const afterOpen = input.slice(startIdx + open.length);
  const endIdx = afterOpen.indexOf(close);
  if (endIdx === -1) return null;

  const inner = afterOpen.slice(0, endIdx);
  if (inner.length === 0) return null;

  return {
    before: input.slice(0, startIdx),
    inner,
    after: afterOpen.slice(endIdx + close.length),
    type,
  };
}

function findLink(input: string): Match | null {
  const bracketIdx = input.indexOf("[");
  if (bracketIdx === -1) return null;

  const afterBracket = input.slice(bracketIdx + 1);
  const closeBracketIdx = afterBracket.indexOf("](");
  if (closeBracketIdx === -1) return null;

  const linkText = afterBracket.slice(0, closeBracketIdx);
  const afterClose = afterBracket.slice(closeBracketIdx + 2);
  const parenIdx = afterClose.indexOf(")");
  if (parenIdx === -1) return null;

  const url = afterClose.slice(0, parenIdx);
  if (linkText.length === 0 || url.length === 0) return null;

  return {
    before: input.slice(0, bracketIdx),
    inner: linkText,
    after: afterClose.slice(parenIdx + 1),
    type: "link",
    url,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
