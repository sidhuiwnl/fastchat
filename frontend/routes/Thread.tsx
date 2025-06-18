import Chat from "@/frontend/components/chat";
import { useParams, useLocation } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { getMessagesByThreadId } from '../dexie/queries';
import { type DBMessage } from '../dexie/db';
import { UIMessage } from 'ai';
import {useUser} from "@clerk/nextjs";

export default function Thread() {
    const { user } = useUser();
    const userId = user?.id as string;



    const { id } = useParams();

    const location = useLocation();

    if (!id) throw new Error('Thread ID is required');



    const messages = useLiveQuery(() => getMessagesByThreadId(userId,id,), [id]);






    const convertToUIMessages = (messages?: DBMessage[]) => {
        return messages?.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts as UIMessage['parts'],
            content: message.content || '',
            createdAt: message.createdAt,
        }));
    };

    // If we have no messages, pass the initialMessage from navigation state
    let initialMessages = convertToUIMessages(messages) || [];
    if ((!messages || messages.length === 0) && location.state?.initialMessage) {
        initialMessages = [
            {
                id: crypto.randomUUID(),
                role: 'user',
                parts: [location.state.initialMessage],
                content: location.state.initialMessage,
                createdAt: new Date(),
            },
        ];
    }

    return (
        <Chat
            key={id}
            threadId={id}
            initialMessages={initialMessages}
            userId={userId}
        />
    );
}