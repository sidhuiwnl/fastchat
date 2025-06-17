import { UIMessage } from 'ai';
import Dexie, { type EntityTable } from 'dexie';

interface Thread {
    id: string;
    userId? : string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt: Date;
}

interface DBMessage {
    id: string;
    userId?: string;
    threadId: string;
    parts: UIMessage['parts'];
    content: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    createdAt: Date;
}

interface MessageSummary {
    id: string;
    threadId: string;
    userId?: string;
    messageId: string;
    content: string;
    createdAt: Date;
}

const db = new Dexie('FastChat') as Dexie & {
    threads: EntityTable<Thread, 'id'>;
    messages: EntityTable<DBMessage, 'id'>;
    messageSummaries: EntityTable<MessageSummary, 'id'>;
};

db.version(2).stores({
    threads: 'id, userId, title, updatedAt, lastMessageAt, [userId+lastMessageAt]',
    messages: 'id, userId,threadId, createdAt, [userId+threadId]',
    messageSummaries: 'id, userId,threadId, messageId, createdAt, [threadId+createdAt]',

});

export type { Thread, DBMessage };
export { db };