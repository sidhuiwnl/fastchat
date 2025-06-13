import { useChat } from '@ai-sdk/react';
import { FormEvent, useState } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatActions } from './useChatActions';
import { ChatStatus } from './types';
import {UIMessage} from "ai";
import {createMessage, createThread, updateThread} from "@/frontend/dexie/queries";
import { v4 as uuidv4 } from 'uuid';
import {useAPIKeyStore} from "@/frontend/stores/APIKeyStore";
import {useModelStore} from "@/frontend/stores/ModelStore";
import {AIModel} from "@/lib/model";

interface ChatProps {
  threadId: string;
  initialMessages ?: UIMessage[];
}

const Chat = ({ threadId ,initialMessages } : ChatProps) => {

  const { getKey } = useAPIKeyStore();

  const selectedModel = useModelStore((state) => state.selectedModel);
  const modelConfig = useModelStore((state) => state.getModelConfig());
  const setSelectedModel = useModelStore((state) => state.setModel);


  const { messages, input, handleInputChange, handleSubmit, status, reload } = useChat({

    api : "/api/chat",
    initialMessages : initialMessages,
    onFinish : async ({ parts }) => {
      const aiMessage : UIMessage = {
        id : uuidv4(),
        parts : parts as UIMessage['parts'],
        role : "assistant",
        content : "",
        createdAt : new Date(),
      }
      try {
        await createMessage(threadId, aiMessage);
      }catch (error){
        console.log(error)
      }
    },
    headers : {
      [modelConfig.headerKey]: getKey(modelConfig.provider) || '',
    },
    body : {
      model : selectedModel
    }
  });



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

    try {

      await createThread({
        id: threadId,
        title: 'New Chat', // Temporary title
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date()
      });

      // Submit the message
      handleSubmit(e, {
        body: {
          model: selectedModel,
        }
      });

      if (isFirstMessage) {
        try {
          const res = await fetch('/api/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              [modelConfig.headerKey]: getKey(modelConfig.provider) || '',
            },
            body: JSON.stringify({
              prompt: currentInput,
              threadId: threadId,
              messageId: crypto.randomUUID(),
            }),
          });

          if (!res.ok) throw new Error('Failed to generate title');

          const { title } = await res.json();
          await updateThread(threadId, {
            title,
            updatedAt: new Date()
          });

        } catch (err) {
          console.error('Error generating title:', err);
          // Fallback to updating with input as title if title generation fails
          await updateThread(threadId, {
            title: currentInput.slice(0, 50), // Truncate long inputs
            updatedAt: new Date()
          });
        } finally {
          setIsFirstMessage(false);
        }
      }
    } catch (error) {
      console.error('Error handling message submission:', error);
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
        onModelChange={(model : AIModel  ) => setSelectedModel(model)}
        selectedModel={selectedModel}
      />
    </div>
  );
};

export default Chat; 