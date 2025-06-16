import { useChat } from '@ai-sdk/react';
import { FormEvent} from 'react';
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
  userId: string;
}

const Chat = ({ threadId, initialMessages,userId }: ChatProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getKey } = useAPIKeyStore();


  const selectedModel = useModelStore((state) => state.selectedModel);
  const modelConfig = useModelStore((state) => state.getModelConfig());
  const setSelectedModel = useModelStore((state) => state.setModel);

  const { complete } = useMessageSummary(userId);

  const { messages, input, handleInputChange, status, reload,append,setInput } = useChat({
    api: "/api/chat",
    initialMessages: initialMessages || [],
    streamProtocol: "data",
    id : threadId,

    onError: (error) => {
      console.error('Chat error:', error);
    },

    onFinish: async (message) => {
      const aiMessage: UIMessage = {
        id: message.id || uuidv4(),
        parts: message.parts as UIMessage['parts'],
        role: 'assistant',
        content: message.content,
        createdAt: message.createdAt || new Date(),
      };

      try {
        await createMessage(threadId,userId,aiMessage);
        await complete(input.trim(), {
          body: { threadId, messageId : message.id, isTitle: true },
        });
      } catch (error) {
        console.error('Error in onFinish:', error);
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

  setInput("")

    const currentInput = input.trim();

    if (!currentInput) {
      console.log('Empty input, returning early');
      return;
    }

    const isFirstMessage = !id;


    if (isFirstMessage) {
      try {
        await createThread(userId,threadId );
        navigate(`/chat/${threadId}`, { replace: true });
      } catch (error) {
        console.error('Error creating thread:', error);
        return;
      }
    }
    const messageId = uuidv4();
    const userMessage: UIMessage = {
      id: messageId,
      role: "user",
      parts: [{ type: "text", text: currentInput }],
      content: currentInput,
      createdAt: new Date(),
    };

    await createMessage(threadId,userId,userMessage);

    try {
        await append(userMessage, {
          body: {
            model: selectedModel,
          },
          headers: {
            [modelConfig.headerKey]: getKey(modelConfig.provider) || '',
          },
        });

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
            onModelChange={(model: AIModel) => setSelectedModel(model)}
            selectedModel={selectedModel}

        />
      </div>
  );
};

export default Chat;