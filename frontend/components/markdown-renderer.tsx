import { memo, useMemo, useState, createContext, useContext } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { marked } from 'marked';
import ShikiHighlighter from 'react-shiki';
import type { ComponentProps } from 'react';
import type { ExtraProps } from 'react-markdown';
import { Check, Copy } from 'lucide-react';

type CodeComponentProps = ComponentProps<'code'> & ExtraProps;
type MarkdownSize = 'default' | 'small';

const MarkdownSizeContext = createContext<MarkdownSize>('default');

const components: Components = {
    code: CodeBlock as Components['code'],
    pre: ({ children }) => <>{children}</>,
    p: ({ children }) => <>{children}</>,
};

function CodeBlock({ children, className, ...props }: CodeComponentProps) {
    const size = useContext(MarkdownSizeContext);
    const match = /language-(\w+)/.exec(className || '');

    if (match) {
        const lang = match[1];
        return (
            <div className="rounded-md overflow-hidden my-2 relative group">
                    <Codebar lang={lang} codeString={String(children)} />
                    <ShikiHighlighter
                        language={lang}
                        theme={'material-theme-darker'}
                        className="text-sm font-mono  overflow-x-auto "
                        showLanguage={false}
                    >
                        {String(children)}
                    </ShikiHighlighter>

            </div>
        );
    }

    const inlineCodeClasses = size === 'small'
        ? 'mx-0.5 rounded px-1 py-0.5  text-foreground font-mono text-xs'
        : 'mx-0.5 rounded px-1.5 py-0.5  text-foreground font-mono text-sm';

    return (
        <code className={inlineCodeClasses} {...props}>
            {children}
        </code>
    );
}

function Codebar({ lang, codeString }: { lang: string; codeString: string }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    };

    return (
        <div className="flex justify-between items-center px-4 py-2 bg-[#2a2a2a]  text-xs">
            <span className="font-mono">{lang}</span>
            <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 hover:bg-gray-700/50 rounded px-2 py-1 transition-colors"
            >
                {copied ? (
                    <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                    </>
                )}
            </button>
        </div>
    );
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
    const tokens = marked.lexer(markdown);
    return tokens.map(token => token.raw).filter(Boolean);
}

function PureMarkdownRendererBlock({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={components}
        >
            {content}
        </ReactMarkdown>
    );
}

const MarkdownRendererBlock = memo(PureMarkdownRendererBlock);

const MemoizedMarkdown = memo(({
                                   content,
                                   id,
                                   size = 'default',
                                   className
                               }: {
    content: string;
    id: string;
    size?: MarkdownSize;
    className : string
}) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    const proseClasses = size === 'small'
        ? 'prose prose-sm dark:prose-invert max-w-none w-full prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0'
        : 'prose prose-base dark:prose-invert max-w-none w-full prose-p:my-1.5 prose-ul:my-1 prose-ol:my-1 prose-li:my-0';

    return (
        <MarkdownSizeContext.Provider value={size}>
            <div className={`${proseClasses} ${className}`} >
                {blocks.map((block, index) => (
                    <MarkdownRendererBlock

                        content={block}
                        key={`${id}-block-${index}`}
                    />
                ))}
            </div>
        </MarkdownSizeContext.Provider>
    );
});

MemoizedMarkdown.displayName = 'MemoizedMarkdown';
export default MemoizedMarkdown;