import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Viewport behavior - elastic scroll prevention', () => {
  const baseCssPath = join(__dirname, '../../styles/base.css');
  const baseCss = readFileSync(baseCssPath, 'utf-8');

  it('applies overflow hidden to html, body, and #app', () => {
    // The css rule should include overflow: hidden in the html, body, #app block
    const htmlBodyAppRule = baseCss.match(/html,\s*body,\s*#app\s*{[^}]+}/s);
    expect(htmlBodyAppRule).not.toBeNull();
    expect(htmlBodyAppRule![0]).toContain('overflow: hidden');
  });

  it('applies overscroll-behavior none to html, body, and #app', () => {
    // The css rule should include overscroll-behavior: none in the html, body, #app block
    const htmlBodyAppRule = baseCss.match(/html,\s*body,\s*#app\s*{[^}]+}/s);
    expect(htmlBodyAppRule).not.toBeNull();
    expect(htmlBodyAppRule![0]).toContain('overscroll-behavior: none');
  });
});
