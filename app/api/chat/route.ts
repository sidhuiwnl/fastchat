import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import {smoothStream} from "ai";


export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: google('gemini-2.0-flash'),
        messages,
        temperature : 0.7,
        experimental_telemetry : {
            isEnabled: false,
        },
        experimental_transform : smoothStream({
            chunking : "line"
        })
    });

    return result.toDataStreamResponse();
}