import { OpenAI } from "openai";
import dotenv from "dotenv";
import {ChatCompletionMessageParam} from "openai/resources/chat";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY! });

export async function generateEmailFromMessages(messages: ChatCompletionMessageParam[]): Promise<string> {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages
    });
    return response.choices[0]?.message?.content || "";
}
