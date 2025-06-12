import {generateText} from "ai";
import {NextResponse} from "next/server";
import { google } from '@ai-sdk/google';


export async function POST(req : Request){
    const { prompt,threadId,messageId } = await req.json();

    console.log(messageId,prompt,threadId);

    try {
        const { text : title } = await generateText({
            model: google('gemini-2.5-flash-preview-04-17'),
            system: `\n
              - you will generate a short title based on the first message a user begins a conversation with
              - ensure it is not more than 80 characters long
              - the title should be a summary of the user's message
              - you should NOT answer the user's message, you should only generate a summary/title
              - do not use quotes or colons`,
            prompt,
        })

        return NextResponse.json({ title, messageId, threadId });
    }catch(error){
        console.error('Failed to generate title:', error);
        return NextResponse.json(
            { error: 'Failed to generate title' },
            { status: 500 }
        );
    }
}