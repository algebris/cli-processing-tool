FROM node:latest

RUN apt-get update && apt-get install -y --no-install-recommends build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN npm install -g pnpm 

WORKDIR /app

COPY mvp /app/mvp
COPY scripts /app/scripts
COPY packages /app/packages

COPY pnpm*.yaml package.json /app/
RUN pnpm install

COPY .env.prod /app/.env
RUN echo "NEXT_PUBLIC_OPENAI_API_KEY=" > /app/mvp/.env.local
COPY id_rsa /app
RUN cd /app/packages/shared-db && pnpm run build
RUN cd /app/scripts && pnpm install canvas && pnpm rebuild
RUN cd /app/mvp && npm run build

EXPOSE 3000

CMD ["npm", "run", "start:mvp"]
