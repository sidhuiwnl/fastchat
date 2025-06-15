import React from 'react';
import { ChatStatus } from './types';
import { Paperclip, ArrowRight, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {AI_MODELS, AIModel} from "@/lib/model";


interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmitWithTitle: (e: React.FormEvent) => void;
  status: ChatStatus;
  selectedModel: string;
  onModelChange: (model: AIModel) => void;


}

const ChatInput: React.FC<ChatInputProps> = ({
                                               input,
                                               handleInputChange,
                                               handleSubmitWithTitle,
                                               status,
                                               selectedModel,
                                               onModelChange,

                                             }) => {


  const [isModelDropdownOpen, setIsModelDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);


  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);





  return (
      <div className="w-full pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-1.5">
            <form onSubmit={ handleSubmitWithTitle} className="relative flex flex-col backdrop-blur-xl">
            <textarea
                id="ai-input"
                placeholder="What can I do for you?"
                value={input}
                onChange={handleInputChange}
                className={cn(
                    "w-full outline-none px-4 py-3 rounded-t-xl",
                    "bg-black/5 dark:bg-white/5 border-none dark:text-white",
                    "placeholder:text-black/70 dark:placeholder:text-white/70",
                    "resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                    "min-h-[72px]"
                )}
            />
              <div className="h-14 bg-black/5 dark:bg-white/5 flex items-center px-3 rounded-b-xl">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                    <label
                        className={cn(
                            "rounded-lg p-2 bg-neutral-800 dark:bg-neutral-800 cursor-pointer",
                            "hover:bg-neutral-700 dark:hover:bg-neutral-700",
                            "text-white dark:text-white"
                        )}
                        aria-label="Attach file"
                    >
                      <input type="file" className="hidden" />
                      <Paperclip className="w-4 h-4 transition-colors" />
                    </label>
                    <button
                        type="button"
                        className={cn(
                            "rounded-lg p-2 bg-neutral-800 dark:bg-neutral-800",
                            "hover:bg-neutral-700 dark:hover:bg-neutral-700",
                            "text-white dark:text-white"
                        )}
                        aria-label="Search"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <div className="relative" ref={dropdownRef}>
                      <button
                          type="button"
                          className={cn(
                              "flex items-center gap-1 text-sm rounded-lg px-3 py-2 ",
                              "bg-neutral-800 dark:bg-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-700 ",
                              "text-white dark:text-white"
                          )}
                          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      >
                        {selectedModel}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {isModelDropdownOpen && (
                          <div className="absolute bottom-full mb-2 left-0 z-10 w-48 bg-neutral-800 dark:bg-neutral-800 rounded-lg shadow-lg border border-white/10">
                            {AI_MODELS.map((model) => (
                                <button
                                    key={model}
                                    type="button"
                                    className={cn(
                                        "w-full text-left px-4 py-2 text-sm hover:bg-neutral-700 hover:rounded-t-lg dark:hover:bg-neutral-700",
                                        "text-white dark:text-white",
                                        model === selectedModel ? "bg-neutral-600 dark:bg-neutral-600" : ""
                                    )}
                                    onClick={() => {
                                      onModelChange(model);
                                      setIsModelDropdownOpen(false);
                                    }}
                                >
                                  {model}
                                </button>
                            ))}
                          </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-black/40 dark:text-white/40">
                      {status === 'streaming' ? 'Generating...' : '\u00A0'}
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
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default ChatInput;