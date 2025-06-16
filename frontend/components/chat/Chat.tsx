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
import {useGuestChatLimit} from "@/hooks/useGuestChatLimit";
import {useUser,SignInButton} from "@clerk/nextjs";
import {toast} from "sonner";
import {Button} from "@/frontend/components/ui/button";


interface ChatProps {
  threadId: string;
  initialMessages?: UIMessage[];
  userId: string;
}

const Chat = ({ threadId, initialMessages,userId }: ChatProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getKey } = useAPIKeyStore();
  const {
    hasReachedLimit,
    incrementGuestChatCount,
    remainingMessages,
    guestChatLimit
  } = useGuestChatLimit();
  const { isSignedIn } = useUser();

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
        const isFirst = !id
        if(isFirst){
          await complete(input.trim(), {
            body: { threadId, messageId : message.id, isTitle: true },
          });
        }

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



    const currentInput = input.trim();

    if (!currentInput) {
      console.log('Empty input, returning early');
      return;
    }
    if (!isSignedIn && hasReachedLimit) {
      toast.error(`Guest limit reached. Please sign in to continue chatting.`);
      return;
    }

    if (!isSignedIn) {
      incrementGuestChatCount();
      if (remainingMessages === 1) {
        toast.info(`You have 1 message remaining. Please sign in to continue.`);
      } else if (remainingMessages <= 3) {
        toast.info(`You have ${remainingMessages} messages remaining as a guest.`);
      }
    }

    setInput("")

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

  if (!isSignedIn && hasReachedLimit) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-bold">Guest Limit Reached</h2>
            <p className="text-muted-foreground">
              You've used all {guestChatLimit} free messages. Sign up or sign in to continue chatting.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <SignInButton mode="modal">
                <Button variant="default">Sign In</Button>
              </SignInButton>
              <SignInButton mode="modal" signUpForceRedirectUrl="/chat">
                <Button variant="outline">Create Account</Button>
              </SignInButton>
            </div>
          </div>
        </div>
    );
  }



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

        <div className=" p-4">
          {!isSignedIn && (
              <div className="text-center text-sm text-muted-foreground mb-2">
                Guest mode: {remainingMessages} of {guestChatLimit} messages remaining
              </div>
          )}
          <ChatInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmitWithTitle={handleSubmitWithTitle}
              status={status as ChatStatus}
              onModelChange={setSelectedModel}
              selectedModel={selectedModel}
          />
        </div>
      </div>
  );
};

export default Chat;