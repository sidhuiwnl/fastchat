import React from 'react';
import { ChatStatus } from './types';
import { Paperclip, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmitWithTitle: (e: React.FormEvent) => void;
  status: ChatStatus;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, handleInputChange, handleSubmitWithTitle, status }) => (
  <div className="w-full pb-4 px-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/5 dark:bg-white/5 rounded-xl p-1.5">
        <form onSubmit={handleSubmitWithTitle} className="relative flex flex-col backdrop-blur-xl">
          <textarea
            id="ai-input"
            placeholder="What can I do for you?"
            value={input}
            onChange={handleInputChange}
            className={cn(
              "w-full rounded-t-xl outline-none rounded-b-none px-4 py-3",
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
                type="submit"
                className={cn(
                  "rounded-lg p-2 bg-black/5 dark:bg-white/5",
                  "hover:bg-black/10 dark:hover:bg-white/10",
                )}
                aria-label="Send message"
                disabled={!input.trim() || status === "streaming"}
              >
                <ArrowRight
                  className={cn(
                    "w-4 h-4 dark:text-white",
                    !input.trim() ? "opacity-30" : "opacity-100",
                  )}
                />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
);

export default ChatInput; 