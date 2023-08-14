import { pRateLimit } from 'p-ratelimit';
import { Configuration, OpenAIApi } from 'openai';

export const tokensMaximumChunkSize = parseInt(process.env.TOKENS_CHUNK_SIZE || '1000', 10);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

export const apiRateLimit = pRateLimit({
  interval: 60000, // 1000 ms == 1 second
  rate: 600, // 30 API calls per interval
  concurrency: 10, // no more than 10 running at once
  maxDelay: 600000, // an API call delayed > 2 sec is rejected
});
