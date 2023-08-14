import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from 'pg';

interface SearchResult {
  doc_search: string;
}

interface ParsedResult {
  id: number,
  documentName: string,
  pageNumber: number,
  title: string,
  text: string,
  tokens: number,
  similarity: number,
}

function parseData(data: SearchResult[]): ParsedResult[] {
  const parsedData: ParsedResult[] = [];

  for (const item of data) {
    const matches = item.doc_search.match(/\((.*?)\)/);
    if (matches) {
      const fields = parseFields(matches[1]);
      const [id, documentName, pageNumber, title, text, tokens, similarity] = fields;

      const entry = {
        id: Number(id),
        documentName,
        pageNumber: Number(pageNumber),
        title,
        text,
        tokens: Number(tokens),
        similarity: Number(similarity)
      }
      parsedData.push(entry);
    }
  }

  return parsedData;
}

function parseFields(dbSearch: string): string[] {
  const fields: string[] = [];
  let field = '';
  let withinQuotes = false;

  for (let i = 0; i < dbSearch.length; i++) {
    const char = dbSearch[i];

    if (char === '"' && dbSearch[i - 1] !== '\\') {
      withinQuotes = !withinQuotes;
    } else if (char === ',' && !withinQuotes) {
      fields.push(field.trim());
      field = '';
    } else {
      field += char;
    }
  }

  fields.push(field.trim());
  return fields;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { query, apiKey, matches } = req.body;

    const input = query.replace(/\n/g, " ");
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input,
      }),
    });

    const json = await response.json();
    const embedding = json.data[0].embedding;

    const pool = new Pool();
    const { rows: result } = await pool.query('SELECT doc_search($1, $2, $3)', [ JSON.stringify(embedding), 0.01, matches ]);
    const parsedData = parseData(result);
    console.log(parseData);
    res.status(200).json(parsedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error" });
  }
};

export default handler;
