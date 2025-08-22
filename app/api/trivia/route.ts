import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getOpenAIClient } from '@/lib/openai';

const triviaRequestSchema = z.object({
  fandom: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  count: z.number().min(1).max(10),
});

export async function POST(req) {
  const { OPENAI_API_KEY } = process.env;

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI not configured" }, { status: 501 });
  }

  const body = await req.json();

  const validationResult = triviaRequestSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { fandom, difficulty, count } = validationResult.data;

  const openaiClient = getOpenAIClient();
  const systemPrompt = `Generate ${count} trivia questions for the fandom "${fandom}" with difficulty "${difficulty}". Provide the questions in JSON format with fields: question, answer, difficulty, sourceHint.`;

  try {
    const response = await openaiClient.createCompletion({
      model: 'text-davinci-003',
      prompt: systemPrompt,
      max_tokens: 150,
    });

    const questions = JSON.parse(response.data.choices[0].text);
    return NextResponse.json({ items: questions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate trivia questions" }, { status: 502 });
  }
}