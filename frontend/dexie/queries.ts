import { db } from './db';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import Dexie from 'dexie';

export const getThreads = async (userId: string) => {
    return await db.threads
        .where({ userId })
        .reverse()
        .sortBy("lastMessageAt");
};


export const createThread = async (userId : string,id: string) => {
    return await db.threads.add({
        id,
        userId,
        title: 'New Chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
    });
};


export const updateThread = async (userId : string,id: string, title: string) => {
    return await db.threads
        .where({ userId,id })
        .modify({
            title,
            updatedAt: new Date(),
        })
};


export const deleteThread = async (userId : string,id: string) => {
    await db.transaction(
        'rw',
        [db.threads, db.messages, db.messageSummaries],
        async () => {
            await db.messages.where({ threadId: id, userId }).delete();
            await db.messageSummaries.where({ threadId: id, userId }).delete();
             await db.threads.where({ id, userId }).delete();
        }
    );
};

export const deleteAllThreads = async () => {
    return db.transaction(
        'rw',
        [db.threads, db.messages, db.messageSummaries],
        async () => {
            await db.threads.clear();
            await db.messages.clear();
            await db.messageSummaries.clear();
        }
    );
};

export const getMessagesByThreadId = async (userId : string,threadId: string) => {
    return await db.messages
        .where({ threadId, userId })
        .sortBy('createdAt');
};

export const createMessage = async (
    userId: string,
    threadId: string,
    message: UIMessage
) => {
    const messageId = uuidv4();
    await db.messages.add({
        id: messageId,
        threadId,
        userId,
        parts: message.parts,
        content: message.content,
        role: message.role,
        createdAt: new Date(),
    });

    // Update thread's last message timestamp
    await db.threads
        .where({ id: threadId, userId })
        .modify({
            lastMessageAt: new Date(),
            updatedAt: new Date(),
        });

    return messageId;
};


// export const deleteTrailingMessages = async (
//     threadId: string,
//     createdAt: Date,
//     gte: boolean = true
// ) => {
//     const startKey = gte
//         ? [threadId, createdAt]
//         : [threadId, new Date(createdAt.getTime() + 1)];
//     const endKey = [threadId, Dexie.maxKey];
//
//    return await db.transaction(
//         'rw',
//         [db.messages, db.messageSummaries],
//         async () => {
//             const messagesToDelete = await db.messages
//                 .where('[threadId+createdAt]')
//                 .between(startKey, endKey)
//                 .toArray();
//
//             const messageIds = messagesToDelete.map((msg) => msg.id);
//
//             await db.messages
//                 .where('[threadId+createdAt]')
//                 .between(startKey, endKey)
//                 .delete();
//
//             if (messageIds.length > 0) {
//                 await db.messageSummaries.where('messageId').anyOf(messageIds).delete();
//             }
//         }
//     );
// };



export const createMessageSummary = async (
    threadId: string,
    messageId: string,
    content: string,
    userId: string,
) => {
   return  await db.messageSummaries.add({
        id: uuidv4(),
        threadId,
       userId,
        messageId,
        content,
        createdAt: new Date(),
    });
};

export const getMessageSummaries = async (threadId: string,userId : string) => {
   return await db.messageSummaries
        .where('[threadId+createdAt]')
        .between([threadId, Dexie.minKey], [threadId, Dexie.maxKey])
        .toArray();
};