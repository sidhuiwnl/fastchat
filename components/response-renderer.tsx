import {marked, RendererObject, type Tokens} from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/base16/material-darker.min.css";
import {CopyIcon} from "lucide-react";

import katex from "katex";
import "katex/dist/katex.min.css";

const clipboardSvg = `
<svg xmlns="http://www.w3.org/2000/svg" class="lucide lucide-clipboard w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
</svg>
`;

const renderer = {


  code(this:RendererObject, { text, lang }: Tokens.Code) {
    const validLang = lang && hljs.getLanguage(lang) ? lang : "plaintext";


    const highlighted = hljs.highlight(text, { language: validLang }).value;
    return `<div class="code-block mb-4"><div class="code-header bg-neutral-800 text-gray-300 px-3 py-2 text-xs font-mono rounded-t-lg flex items-center justify-between">${validLang}<button class="cursor-pointer">${clipboardSvg}</button></div><pre class="m-0"><code class="hljs language-${validLang} block p-3 rounded-b-lg overflow-x-auto">${highlighted}</code></pre></div>`;
  },
};

marked.use({
  renderer,
  extensions: [
    {
      name: "katex",
      level: "inline",

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

      renderer(token) {
        try {
          return katex.renderToString(token.text, {
            displayMode: token.block,
            throwOnError: false,
          });
        } catch (err) {
          return `<code>${token.text(err)}</code>`;
        }
      },
    },
  ],
});

export function MarkedRenderer({ content }: { content: string }) {
  const html = marked(content);

  return (

        <div
            className="prose prose-sm max-w-none "
            dangerouslySetInnerHTML={{ __html: html }}
        />


  );
}