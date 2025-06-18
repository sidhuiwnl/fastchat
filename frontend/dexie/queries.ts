import { db } from './db';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import {DBMessage} from "./db";

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



export const createMessage = async (threadId: string, message: UIMessage, userId?: string) => {
    return await db.transaction('rw', [db.messages, db.threads], async () => {

        const newMessage: DBMessage = {
            id: message.id,
            threadId,
            parts: message.parts,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt ?? new Date()
        };


        if (userId) {
            newMessage.userId = userId;
        }

        await db.messages.add(newMessage);

        await db.threads.update(threadId, {
            lastMessageAt: message.createdAt ?? new Date()
        });
    });
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



// export const updateMessage = async (
//     userId: string | undefined,
//     threadId: string,
//     messageId: string,
//     content: string
// ) => {
//     console.log("userId:", userId);
//     console.log("threadId:", threadId);
//     console.log("messageId:", messageId);
//     console.log("content:", content);
//
//     try {
//         const message = await db.messages
//             .where({ id: messageId, threadId })
//             .first();
//
//         if (!message) {
//             console.error("Message not found.");
//             return false;
//         }
//
//         if (userId && message.userId !== userId) {
//             console.error("Not authorized to edit this message.");
//             return false;
//         }
//
//         const updatedCount = await db.messages.update(messageId, {
//             content,
//             parts: [{ type: "text", text: content }],
//         });
//
//         if (updatedCount === 0) {
//             console.warn("Message update failed.");
//             return false;
//         }
//
//         return true;
//     } catch (error) {
//         console.error("Error updating message.", error);
//         throw error;
//     }
// };
