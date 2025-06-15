import React from 'react';
import { ChatStatus } from './types';
import MemoizedMarkdown from '../markdown-renderer';
import BouncingDots from '../bouncing-dot';
import { Copy, RefreshCw, Edit } from 'lucide-react';
import { UIMessage } from 'ai';

interface MessageListProps {
  messages: UIMessage[];
  hoveredMessageId: string | null;
  setHoveredMessageId: (id: string | null) => void;
  editingMessageId: string | null;
  setEditingMessageId: (id: string | null) => void;
  editedContent: string;
  setEditedContent: (content: string) => void;
  handleCopy: (text: string) => void;
  handleEdit: (messageId: string, content: string) => void;
  handleSaveEdit: (messageId: string) => void;
  reload: () => void;
  status: ChatStatus | string
}

const MessageList: React.FC<MessageListProps> = ({
                                                   messages,
                                                   hoveredMessageId,
                                                   setHoveredMessageId,
                                                   editingMessageId,
                                                   setEditingMessageId,
                                                   editedContent,
                                                   setEditedContent,
                                                   handleCopy,
                                                   handleEdit,
                                                   handleSaveEdit,
                                                   reload,
                                                   status,
                                                 }) => (
    <>
      {messages.map(message => (
          <div
              key={message.id}
              className="whitespace-pre-wrap relative group"
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 relative`}
            >
              <div
                  className={
                    message.role === 'user'
                        ? "px-4 py-2 rounded-lg inline-block w-fit max-w-[80%] bg-neutral-300"
                        : "max-w-[80%] mt-1 pb-20"
                  }
              >
                {editingMessageId === message.id ? (
                    <div className="flex flex-col">
                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-2 rounded text-black"
                    autoFocus
                />
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-2 py-1 text-xs  rounded text-black"
                        >
                          Cancel
                        </button>
                        <button
                            onClick={() => handleSaveEdit(message.id)}
                            className="px-2 py-1 text-xs rounded text-black"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                ) : (
                    <>
                      <MemoizedMarkdown
                          content={message.content || ""}
                          id={message.id}
                          size="default"
                          className={message.role === 'user' ? 'text-black' : ''}
                      />
                    </>
                )}
              </div>
              {message.role === 'user' && hoveredMessageId === message.id && editingMessageId !== message.id && (
                  <div
                      className="absolute  flex justify-center space-x-2 pt-2 z-10"
                      style={{ top: '100%' }}
                  >
                    <button
                        onClick={() => handleCopy(message.content || "")}
                        className="p-1 "
                        title="Copy"
                    >
                      <Copy className="w-4 h-4 " />
                    </button>
                    <button
                        onClick={() => reload()}
                        className="p-1  "
                        title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4 " />
                    </button>
                    <button
                        onClick={() => handleEdit(message.id, message.content || "")}
                        className="p-1 "
                        title="Edit"
                    >
                      <Edit className="w-4 h-4 " />
                    </button>
                  </div>
              )}
            </div>
          </div>
      ))}
      {status === "submitted" && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%] mt-1 pb-20">
              <BouncingDots />
            </div>
          </div>
      )}
    </>
);

export default MessageList;