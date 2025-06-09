import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import {smoothStream} from "ai";


export const maxDuration = 30;
export const runtime = 'edge';

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: google('gemini-2.0-flash'),
        system : `You are fastchat, an ai assistant that can answer questions and help with tasks.
      Be helpful and provide relevant information
      Be respectful and polite in all interactions.
      Be engaging and maintain a conversational tone.
      Always use LaTeX for mathematical expressions - 
      Inline math must be wrapped in single dollar signs: $content$
      Display math must be wrapped in double dollar signs: $$content$$
      Display math should be placed on its own line, with nothing else on that line.
      Do not nest math delimiters or mix styles.
      Examples:
      - Inline: The equation $E = mc^2$ shows mass-energy equivalence.
      - Display: 
      $$\\frac{d}{dx}\\sin(x) = \\cos(x)$$
      `,
        messages,
        temperature : 0.2,
        experimental_telemetry : {
            isEnabled: false,
        },
        experimental_transform : smoothStream({
            delayInMs : 0,
            chunking : "word"
        })
    });

    return result.toDataStreamResponse();
}