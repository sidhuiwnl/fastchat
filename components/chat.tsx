import { useChat } from '@ai-sdk/react';
import { MarkedRenderer } from './response-renderer';
import {useState} from "react";

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat();
    const [isFirstMessage, setIsFirstMessage] = useState(true);

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
        <div className="flex flex-col justify-between items-center max-w-4xl w-full px-4 py-24 h-full">
            <div className="w-full space-y-4 overflow-y-auto flex-1">
                {messages.map(message => (
                    <div key={message.id} className="whitespace-pre-wrap">
                        {message.role === 'user' ? 'User: ' : 'AI: '}
                        {message.parts.map((part, i) => {
                            if (part.type === 'text') {
                                return (
                                    <div key={`${message.id}-${i}`}>
                                        <MarkedRenderer content={part.text} />
                                    </div>
                                );
                            }
                        })}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmitWithTitle} className="w-full mt-4">
                <input
                    className="dark:bg-zinc-900 w-full p-3 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
        </div>
    );
}
