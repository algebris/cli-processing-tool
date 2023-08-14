# itBoat GPT

AI-powered search and chat.

## How It Works

GPT provides 2 things:

1. A search interface.
2. A chat interface.
3. A database search interface.

### Search

Search was created with [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) (`text-embedding-ada-002`).

First, we loop over the essays and generate embeddings for each chunk of text.

Then in the app we take the user's search query, generate an embedding, and use the result to find the most similar passages from the book.

The comparison is done using cosine similarity across our database of vectors.

Our database is a Postgres database with the [pgvector](https://github.com/pgvector/pgvector) extension hosted on [Supabase](https://supabase.com/).

Results are ranked by similarity score and returned to the user.
script for creating table in Supabase for pdf documents: schema.sql
script for creating table in Supabase for csv documents: schema-db.sql

### Chat

Chat builds on top of search. It uses search results to create a prompt that is fed into GPT-4.

This allows for a chat-like experience where the user can ask questions about the book and get answers.

## Running Locally

Here's a quick overview of how to run it locally.

### Requirements

1. Set up OpenAI

You'll need an OpenAI API key to generate embeddings.

2. Set up local Postgres DB

Just put connection variables into .env.local

### Repo Setup

3. Clone repo

4. Install dependencies

```bash
pnpm i
```

5. Set up environment variables

Create a .env.local file in the root of the repo with the following variables:

```bash

NEXT_PUBLIC_OPENAI_API_KEY=sk-UYGuygseduygedsgyewuoewygscUYG

PGUSER=postgres
PGHOST=localhost
PGPASSWORD=postgres_password
PGDATABASE=postgres
PGPORT=32768

```

### App

8. Run app

```bash
npm run dev
```
