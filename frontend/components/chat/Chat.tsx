import { useChat } from '@ai-sdk/react';
import { FormEvent, useState } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatActions } from './useChatActions';
import { ChatStatus } from './types';
import {UIMessage} from "ai";

interface ChatProps {
  threadId: string;
  initialMessages ?: UIMessage[];
}

const Chat = ({ threadId ,initialMessages } : ChatProps) => {
  const { messages, input, handleInputChange, handleSubmit, status, reload } = useChat();
  const {
    hoveredMessageId,
    setHoveredMessageId,
    editingMessageId,
    setEditingMessageId,
    editedContent,
    setEditedContent,
    handleCopy,
    handleEdit,
    handleSaveEdit,
  } = useChatActions();
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  const handleSubmitWithTitle = async (e: FormEvent) => {
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
      }
    }
  };

  return (
    <div className="h-full w-full relative flex flex-col">
      <div className="flex-1 overflow-y-auto pb-[120px]">
        <div className="w-full max-w-4xl mx-auto pt-4 px-4">
          <MessageList
            messages={messages || initialMessages}
            hoveredMessageId={hoveredMessageId}
            setHoveredMessageId={setHoveredMessageId}
            editingMessageId={editingMessageId}
            setEditingMessageId={setEditingMessageId}
            editedContent={editedContent}
            setEditedContent={setEditedContent}
            handleCopy={handleCopy}
            handleEdit={handleEdit}
            handleSaveEdit={handleSaveEdit}
            reload={reload}
            status={status as ChatStatus}
          />
        </div>
      </div>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmitWithTitle={handleSubmitWithTitle}
        status={status as ChatStatus}
      />
    </div>
  );
};

export default Chat; 