import { marked, type Tokens } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

import katex from "katex";
import "katex/dist/katex.min.css";

// --- Configure Marked for Code Syntax Highlighting ---
marked.setOptions({
  highlight: (code, lang) => {
    const validLang = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language: validLang }).value;
  },
  langPrefix: "hljs language-",
});

// --- Add a custom extension for KaTeX math rendering ---
marked.use({

  extensions: [
    {
      name: "katex",
      level : "inline",

      // Optional optimization for tokenizer
      start(src) {
        const match = src.match(/\$+/);
        return match ? match.index : undefined;
      },

      tokenizer(src) {
        const inlineMatch = /^\$([^\$]+?)\$/;
        const blockMatch = /^\$\$([^\$]+?)\$\$/;

        const block = blockMatch.exec(src);
        if (block) {
          const token: Tokens.Generic = {
            type: "katex",
            raw: block[0],
            text: block[1],
            block: true,
          };
          return token;
        }

        const inline = inlineMatch.exec(src);
        if (inline) {
          const token: Tokens.Generic = {
            type: "katex",
            raw: inline[0],
            text: inline[1],
            block: false,
          };
          return token;
        }

        return;
      },

      renderer(token: any) {
        try {
          return katex.renderToString(token.text, {
            displayMode: token.block,
            throwOnError: false,
          });
        } catch (err) {
          return `<code>${token.text}</code>`;
        }
      },
    },
  ],
});

export function MarkedRenderer({ content }: { content: string }) {
  const html = marked(content);

  return (
      <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
      />
  );
}
