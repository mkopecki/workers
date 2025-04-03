FROM oven/bun:latest as builder
WORKDIR /app

COPY package.json ./
COPY packages packages

RUN bun install
COPY . .

WORKDIR /app/packages/workers_client

EXPOSE 4173
CMD ["bun", "run", "preview"]
