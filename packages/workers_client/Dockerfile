FROM oven/bun:latest
WORKDIR /app

COPY package.json ./
COPY packages packages

RUN bun install
COPY . .

WORKDIR /app/packages/workers_client

EXPOSE 80
CMD ["bun", "run", "dev"]
