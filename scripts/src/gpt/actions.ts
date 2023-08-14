import { encode } from 'gpt-3-encoder';
import { openai, tokensMaximumChunkSize, apiRateLimit } from './config';
import { GptModels, GetSummaryOutput } from './types';
import { cutOffIfSentenceHasNoPoint } from './utils'; // explicitly apply pipe method to String from ./utils

export const getTokensCount = (text: string) => encode(text).length;

export const getSummary = async (text: string, id: number): Promise<GetSummaryOutput> => {
  const tokens = getTokensCount(text);
  if (tokens > tokensMaximumChunkSize) {
    const result = await apiRateLimit(() => gptSummaryCall(text));
    const summary = (result.data.choices[0].text || '').replace(/[\r\n]/gm, '').trim();
    const trimmedSummary = cutOffIfSentenceHasNoPoint(summary);
    const newTokens = getTokensCount(trimmedSummary);
    console.log('Summary created', { id, tokens: newTokens });
    return { tokens: newTokens, summary: trimmedSummary, skipped: false };
  } else {
    console.log('Skip building summary', { id, tokens });
    return { tokens, summary: text, skipped: true };
  }
};

export const getEmbedding = async (text: string, id: number) => {
  const result = await apiRateLimit(() => gptEmbeddingCall(text));
  const embedding = result.data;
  console.log(`Embedding vector has been created for id=${id}`);
  return { embedding };
};

const gptSummaryCall = (text: string) =>
  openai.createCompletion({
    model: GptModels.DaVinci,
    prompt: `Summarize the following text into ${tokensMaximumChunkSize} tokens:\n\n${text}`,
    max_tokens: tokensMaximumChunkSize,
    temperature: 0,
  });

const gptEmbeddingCall = (text: string) =>
  openai.createEmbedding({
    model: GptModels.Embedding,
    input: text,
  });
