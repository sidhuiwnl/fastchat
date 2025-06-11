import { useChat } from '@ai-sdk/react';
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Paperclip, ArrowRight } from "lucide-react";
import { FormEvent } from "react";
import MemoizedMarkdown from "@/components/markdown-renderer";

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat();
    const [isFirstMessage, setIsFirstMessage] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmitWithTitle = async (e: FormEvent) => {
        setIsLoading(true);
        e.preventDefault();

        const currentInput = input.trim();
        if (!currentInput) return;

        handleSubmit(e);

        if (isFirstMessage) {
            try {
                const res = await fetch('/api/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: currentInput,
                        threadId: '1',
                        messageId: crypto.randomUUID(),
                    }),
                });
                const { title } = await res.json();
                console.log('Generated title:', title);
            } catch (err) {
                console.error('Error generating title:', err);
            } finally {
                setIsFirstMessage(false);
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="h-screen w-full relative">

            <div className="overflow-y-auto h-full pb-[120px] px-4">
                <div className="w-full max-w-3xl mx-auto pt-4">
                    {messages.map(message => (
                        <div key={message.id} className="whitespace-pre-wrap">
                            {message.parts.map((part, i) => {
                                if (part.type === 'text') {
                                    return (
                                        <div
                                            key={`${message.id}-${i}`}
                                            className={`flex ${message.role === 'user' ? 'justify-end mb-4  ' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] ${message.role === 'assistant' ? 'mt-1 pb-20' : ''}`}>
                                                <MemoizedMarkdown
                                                    content={part.text || ""}
                                                    id={message.id}
                                                    size="default"
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed input container */}
            <div className="fixed -bottom-6 -left-5 w-full px-4 pb-4  z-10">
                <div className="bg-black/5  dark:bg-white/5 w-[1200px]  rounded-xl p-1.5 max-w-4xl mx-auto">
                    <div className="relative  flex flex-col backdrop-blur-xl">
                        <textarea
                            id="ai-input"
                            placeholder="What can I do for you?"
                            value={input}
                            onChange={handleInputChange}
                            className={cn(
                                "w-full rounded-t-xl outline-none  rounded-b-none px-4 py-3",
                                "bg-black/5 dark:bg-white/5 border-none dark:text-white",
                                "placeholder:text-black/70 dark:placeholder:text-white/70",
                                "resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                "min-h-[72px]"
                            )}
                        />
                        <div className="h-14 bg-black/5 dark:bg-white/5 flex items-center px-3">
                            <div className="w-full flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                                    <label
                                        className={cn(
                                            "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                                            "hover:bg-black/10 dark:hover:bg-white/10",
                                            "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white",
                                        )}
                                        aria-label="Attach file"
                                    >
                                        <input type="file" className="hidden" />
                                        <Paperclip className="w-4 h-4 transition-colors" />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className={cn(
                                        "rounded-lg p-2 bg-black/5 dark:bg-white/5",
                                        "hover:bg-black/10 dark:hover:bg-white/10",
                                    )}
                                    onClick={handleSubmitWithTitle}
                                    aria-label="Send message"
                                    disabled={!input.trim() || isLoading}
                                >
                                    <ArrowRight
                                        className={cn(
                                            "w-4 h-4 dark:text-white",
                                            !input.trim() ? "opacity-30" : "opacity-100",
                                            isLoading ? "animate-spin" : ""
                                        )}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
