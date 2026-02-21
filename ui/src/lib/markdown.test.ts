import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  describe("inline formatting", () => {
    it("renders bold text", () => {
      expect(renderMarkdown("**hello**")).toBe("<strong>hello</strong>");
    });

    it("renders italic text", () => {
      expect(renderMarkdown("*hello*")).toBe("<em>hello</em>");
    });

    it("renders inline code", () => {
      expect(renderMarkdown("`code`")).toBe(
        '<code class="inline-code">code</code>',
      );
    });

    it("renders links", () => {
      expect(renderMarkdown("[text](https://example.com)")).toBe(
        '<a href="https://example.com" target="_blank" rel="noopener">text</a>',
      );
    });

    it("renders mixed inline formatting", () => {
      const result = renderMarkdown("**bold** and *italic*");
      expect(result).toContain("<strong>bold</strong>");
      expect(result).toContain("<em>italic</em>");
    });
  });

  describe("block elements", () => {
    it("renders fenced code blocks", () => {
      const input = "```\nconst x = 1;\n```";
      expect(renderMarkdown(input)).toBe(
        '<pre class="code-block"><code>const x = 1;</code></pre>',
      );
    });

    it("renders blockquotes", () => {
      const result = renderMarkdown("> quoted text");
      expect(result).toContain("<blockquote");
      expect(result).toContain("quoted text");
    });

    it("joins inline lines with br", () => {
      expect(renderMarkdown("line one\nline two")).toBe(
        "line one<br>line two",
      );
    });

    it("does not add br adjacent to block elements", () => {
      const input = "before\n```\ncode\n```\nafter";
      const result = renderMarkdown(input);
      expect(result).not.toMatch(/><br><pre/);
      expect(result).not.toMatch(/code><br>/);
    });
  });

  describe("html escaping", () => {
    it("escapes html in plain text", () => {
      expect(renderMarkdown("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert('xss')&lt;/script&gt;",
      );
    });

    it("escapes html inside bold markers", () => {
      expect(renderMarkdown("**<b>nope</b>**")).toBe(
        "<strong>&lt;b&gt;nope&lt;/b&gt;</strong>",
      );
    });

    it("escapes html in code blocks", () => {
      const input = "```\n<script>alert('xss')</script>\n```";
      const result = renderMarkdown(input);
      expect(result).toContain("&lt;script&gt;");
      expect(result).not.toContain("<script>");
    });

    it("escapes html in link text and urls", () => {
      const result = renderMarkdown(
        '[<img>](javascript:alert("xss"))',
      );
      expect(result).not.toContain("<img>");
      expect(result).toContain("&lt;img&gt;");
    });
  });

  describe("long message handling", () => {
    it("handles extremely long plain text without failing", () => {
      const longText = "a".repeat(100000);
      const result = renderMarkdown(longText);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it("handles extremely long text with markdown formatting", () => {
      const longText = "**bold** ".repeat(10000);
      const result = renderMarkdown(longText);
      expect(result).toBeDefined();
      expect(result).toContain("<strong>bold</strong>");
    });

    it("handles extremely long code blocks", () => {
      const codeLines = Array(5000).fill("const x = 1;").join("\n");
      const input = `\`\`\`\n${codeLines}\n\`\`\``;
      const result = renderMarkdown(input);
      expect(result).toBeDefined();
      expect(result).toContain('<pre class="code-block">');
    });
  });
});
