import { streamText,smoothStream } from 'ai';
import {createGoogleGenerativeAI} from "@ai-sdk/google";
import {createOpenAI} from "@ai-sdk/openai";
import {createOpenRouter} from "@openrouter/ai-sdk-provider";
import {getModelConfig,AIModel} from "@/lib/model";
import {headers} from "next/headers";
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;
export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { messages,model } = await req.json();



        const headerList = await headers();

        const modelConfig = getModelConfig(model as AIModel);



        const apiKey = headerList.get(modelConfig.headerKey) as string;



        let aiModel;
        switch (modelConfig.provider) {
            case 'google':
                const google = createGoogleGenerativeAI({ apiKey });
                aiModel = google(modelConfig.modelId);
                break;

            case 'openai':
                const openai = createOpenAI({ apiKey });
                aiModel = openai(modelConfig.modelId);
                break;

            case 'openrouter':
                const openrouter = createOpenRouter({ apiKey });
                aiModel = openrouter(modelConfig.modelId);
                break;

            default:
                return new Response(
                    JSON.stringify({ error: 'Unsupported model provider' }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
        }



        const result = streamText({
            model: aiModel,

            system: `You are FastChat, an AI assistant that can answer questions and help with tasks.
Be helpful and provide relevant information.
Be respectful and polite in all interactions.
Be engaging and maintain a conversational tone.

Always use LaTeX for mathematical expressions:
- Inline math must be wrapped in single dollar signs: $content$
- Display math must be wrapped in double dollar signs: $$content$$
- Display math should be placed on its own line, with nothing else on that line
- Do not nest math delimiters or mix styles

Examples:
- Inline: The equation $E = mc^2$ shows mass-energy equivalence.
- Display:
$$\\frac{d}{dx}\\sin(x) = \\cos(x)$$`,
            messages,
            onError: (error) => {
                console.log('error', error);
            },
            experimental_telemetry: {
                isEnabled: false,
            },
            experimental_transform: smoothStream({
                delayInMs: 0,
                chunking: "word"
            }),
            abortSignal: req.signal,
        });

        return result.toDataStreamResponse({
            sendReasoning : true,
            getErrorMessage: (error) => {
                return (error as { message: string }).message;
            },
        });
    }catch (e) {
        console.log('error', e);
        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );

    }

}