import { useChat } from '@ai-sdk/react';
import { FormEvent, useEffect } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatActions } from './useChatActions';
import { ChatStatus } from './types';
import { UIMessage } from "ai";
import { createMessage, createThread } from "@/frontend/dexie/queries";
import { v4 as uuidv4 } from 'uuid';
import { useAPIKeyStore } from "@/frontend/stores/APIKeyStore";
import { useModelStore } from "@/frontend/stores/ModelStore";
import { AIModel } from "@/lib/model";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { useMessageSummary } from "@/hooks/useMessageSummary";

interface ChatProps {
  threadId: string;
  initialMessages?: UIMessage[];
}

const Chat = ({ threadId, initialMessages }: ChatProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getKey } = useAPIKeyStore();

  const selectedModel = useModelStore((state) => state.selectedModel);
  const modelConfig = useModelStore((state) => state.getModelConfig());
  const setSelectedModel = useModelStore((state) => state.setModel);

  const { complete } = useMessageSummary();



  const { messages, input, handleInputChange, handleSubmit, status, reload } = useChat({
    api: "/api/chat",
    initialMessages: initialMessages,


    onResponse: (response) => {
      console.log('API Response:', response);
    },

    onError: (error) => {
      console.error('Chat error:', error);
    },

    onFinish: async (message) => {
      console.log('Chat finished with message:', message);


      const aiMessage: UIMessage = {
        id: message.id || uuidv4(),
        parts: message.parts as UIMessage['parts'],
        role: "assistant",
        content: message.content,
        createdAt: message.createdAt || new Date(),
      };

      try {
        await createMessage(threadId, aiMessage);
        console.log('AI message saved to DB:', aiMessage);
      } catch (error) {
        console.error('Error saving AI message:', error);
      }
    },

    headers: {
      [modelConfig.headerKey]: getKey(modelConfig.provider) || '',
    },

    body: {
      model: selectedModel
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

  const handleSubmitWithTitle = async (e: FormEvent) => {
    e.preventDefault();


    const messageId = uuidv4();

    const currentInput = input.trim();

    const userMessage: UIMessage = {
      id: messageId,
      role: "user",
      parts : [{ type : "text", text : currentInput}],
      content: currentInput,
      createdAt: new Date(),
    };

    // Save user message to DB
    await createMessage(threadId, userMessage);

    if (!id) {
      navigate(`/chat/${threadId}`);
      await createThread(threadId);
      await complete(currentInput, {
        body: { threadId, messageId, isTitle: true },
      });
    }




    if (!currentInput) {
      console.log('Empty input, returning early');
      return;
    }

    try {

      handleSubmit(e, {
        body: {
          model: selectedModel,
        }
      });

    } catch (error) {
      console.error('Error handling message submission:', error);
    }
  };

  // Debug: Log the current status
  console.log('Chat status:', status);
  console.log('Selected model:', selectedModel);

  return (
      <div className="h-full w-full relative flex flex-col">
        <div className="flex-1 overflow-y-auto pb-[120px]">
          <div className="w-full max-w-4xl mx-auto pt-4 px-4">


            <MessageList
                messages={messages || initialMessages || []}
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
            onModelChange={(model: AIModel) => setSelectedModel(model)}
            selectedModel={selectedModel}
        />
      </div>
  );
};

export default Chat;