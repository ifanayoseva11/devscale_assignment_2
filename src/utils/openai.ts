import { createParsedCompletion, type ZodSchema } from "@anvia/core";
import { OpenAIClient } from "@anvia/openai";
import { env } from "./env.js";

const client = new OpenAIClient({ apiKey: env.OPENAI_API_KEY });
const completionModel = client.completionModel("gpt-4.1-mini");

export async function generateParsedAIResponse<T>(
  instructions: string,
  input: string,
  preferredSchema: ZodSchema<T>,
): Promise<T> {
  const response = await createParsedCompletion(completionModel, {
    instructions,
    input,
    schema: preferredSchema,
    maxTokens: 3000,
  });

  return response.data;
}

