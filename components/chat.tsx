import { useChat } from '@ai-sdk/react';
import { MarkedRenderer } from './response-renderer';
import {useState} from "react";
import { cn } from "@/lib/utils"
import {Paperclip,ArrowRight,User,Sparkles} from "lucide-react";

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat();
    const [isFirstMessage, setIsFirstMessage] = useState(true);
    const [value, setValue] = useState("");
    const[isLoading, setIsLoading] = useState(false);


    const handleSubmitWithTitle = async (e: React.FormEvent) => {
        e.preventDefault();


        const currentInput = input.trim();


        if (!currentInput) return;


        await handleSubmit(e);


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
            }
        }
    };


    return (
        <div className="flex flex-col max-w-3xl items-center w-full  px-4 pt-4 h-screen relative">


            <div className="fixed inset-0 flex flex-col overflow-y-auto">

                <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-4">
                    {messages.map(message => (
                        <div key={message.id} className="whitespace-pre-wrap">

                            {message.parts.map((part, i) => {
                                if (part.type === 'text') {
                                    return (
                                        <div
                                            key={`${message.id}-${i}`}
                                            className={`mb-10 flex items-start space-x-3 ${
                                                message.role === 'user' ? 'justify-end ' : ''
                                            }`}
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                {message.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                                            </div>
                                            <div className="max-w-[80%]">
                                                <MarkedRenderer content={part.text} />
                                            </div>
                                        </div>


                                    );
                                }
                            })}
                        </div>
                    ))}
                </div>
            </div>



            <div className="fixed bottom-0 left-0 w-full flex  justify-center">
                <div className="w-full max-w-4xl">
                    <div className="bg-black/5 dark:bg-white/5 backdrop-blur-xl rounded-t-2xl p-1.5">
                        <div className="relative">
                            <div className="relative flex flex-col ">
                                <div className="overflow-y-auto " style={{ maxHeight: "400px" }}>
                            <textarea
                                id="ai-input-15"
                                placeholder={"What can I do for you?"}
                                value={input}
                                onChange={handleInputChange}
                                className={cn(
                                    "w-full rounded-t-xl outline-none rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "min-h-[72px]"
                                )}
                            />
                                </div>

                                <div className="h-14 bg-black/5 dark:bg-white/5  flex items-center">
                                    <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                                            <label
                                                className={cn(
                                                    "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                                                    "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
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
                                                "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                            )}
                                            onClick={handleSubmitWithTitle}
                                            aria-label="Send message"
                                            disabled={!input.trim()}
                                        >
                                            <ArrowRight
                                                className={cn(
                                                    "w-4 h-4 dark:text-white transition-opacity duration-200",
                                                    input.trim() ? "opacity-100" : "opacity-30",
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
            </div>
        </div>
    );
}
