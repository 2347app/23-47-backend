import OpenAI from "openai";
import { env } from "../config/env";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI | null {
  if (!env.openaiApiKey) return null;
  if (!_client) {
    _client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return _client;
}

export async function jsonChat<T = unknown>(args: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<T> {
  const client = getOpenAI();
  if (!client) {
    throw new Error("openai_not_configured");
  }
  const completion = await client.chat.completions.create({
    model: env.openaiModel,
    temperature: args.temperature ?? 0.85,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: args.system },
      { role: "user", content: args.user },
    ],
  });
  const content = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as T;
}
