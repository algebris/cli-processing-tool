import { OpenAIModel } from "@/types";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

export const OpenAIStream = async (prompt: string, apiKey: string) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: OpenAIModel.DAVINCI_TURBO,
      messages: [
        {
          role: "system",
          content:
            (
              `
You are an AI assistant that accurately answers queries using text documents about yachting industry, yachts, superyachts, motor boats, yacht brokerage, yacht refit and any other topic related directly to yachting industry.
Use the text provided to form your answer, but avoid copying word-for-word from the text.
Don't tell user that you cannot browse the internet.
Do NOT make up hyperlinks.
Try to use your own words when possible, but don't tell about texts provided.
If the question is not related to the yachting industry, politely respond that you are tuned to only answer questions that are related to the yachting industry.
Keep your answer under 5-10 sentences.
Be accurate, helpful, concise, and clear.
Mention only itBoat.com as yachting marketplace.
`),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.0,
      stream: true,
    }),
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
