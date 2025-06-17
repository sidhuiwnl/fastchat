import { db } from './db';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import Dexie from 'dexie';

export const getThreads = async (userId : string | undefined) => {
    if (userId) {
        return await db.threads
            .where({ userId })
            .reverse()
            .sortBy("lastMessageAt");

    } else {
        return await db.threads
            .reverse()
            .sortBy("lastMessageAt");

    }
};

export const createThread = async (userId : string | undefined, id : string) => {
    return await db.threads.add({
        id,
        userId,
        title: 'New Chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date()
    });
};



export const updateThread = async (userId : string | undefined, id : string, title : string) => {
    if (userId) {
        return await db.threads
            .where({ userId, id })
            .modify({ title, updatedAt: new Date() });
    } else {
        return await db.threads
            .where({ id })
            .modify({ title, updatedAt: new Date() });
    }
};


export const deleteThread = async (userId : string | undefined, id : string) => {
    await db.transaction(
        'rw',
        [db.threads, db.messages, db.messageSummaries],
        async () => {
            if (userId) {
                await db.messages.where({ threadId: id, userId }).delete();
                await db.messageSummaries.where({ threadId: id, userId }).delete();
                await db.threads.where({ id, userId }).delete();
            } else {
                await db.messages.where("threadId").equals(id).delete();
                await db.messageSummaries.where("threadId").equals(id).delete();
                await db.threads.where("id").equals(id).delete();
            }
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

export const getMessagesByThreadId = async (userId : string | undefined, threadId : string) => {

    if (userId) {
        return await db.messages
            .where({ threadId, userId })
            .sortBy("createdAt");

    } else {
        return await db.messages
            .where("threadId")
            .equals(threadId)
            .sortBy("createdAt");

    }
};



export const createMessage = async (userId : string | undefined, threadId : string, message : UIMessage) => {
    const messageId = uuidv4();

    await db.messages.add({
        id: messageId,
        threadId,
        userId,
        parts: message.parts,
        content: message.content,
        role: message.role,
        createdAt: new Date()
    });

    // Update thread's last message timestamp
    if (userId) {
        await db.threads
            .where({ id: threadId, userId })
            .modify({ lastMessageAt: new Date(), updatedAt: new Date() });
    } else {
        await db.threads
            .where({ id: threadId })
            .modify({ lastMessageAt: new Date(), updatedAt: new Date() });
    }

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



export const createMessageSummary = async (threadId : string, messageId : string, content : string, userId : string | undefined) => {
    return await db.messageSummaries.add({
        id: uuidv4(),
        threadId,
        messageId,
        content,
        userId,
        createdAt: new Date()
    });
};


export const getMessageSummaries = async (threadId : string, userId : string | undefined) => {
    if (userId) {
        return await db.messageSummaries
            .where({ threadId, userId })
            .sortBy("createdAt");

    } else {
        return await db.messageSummaries
            .where("threadId")
            .equals(threadId)
            .sortBy("createdAt");

    }
};

export const updateMessage = async (userId: string | undefined, threadId: string, messageId: string, content: string) => {
    console.log("userId ", userId);
    console.log("threadId ", threadId);
    console.log("content ", content);
    console.log("messageId ", messageId);

    try {
        if (userId) {
            await db.messages.update(messageId, {
                content,
                parts: [{ type: "text", text: content }]
            });
        } else {
            await db.messages
                .where({ id: messageId, threadId })
                .modify({
                    content,
                    parts: [{ type: "text", text: content }]
                });
        }
        return true; // Return true for both cases
    } catch (error) {
        console.error('Error updating message:', error);
        throw error;
    }
}