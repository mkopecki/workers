FROM oven/bun:alpine
WORKDIR /app
COPY . .
RUN bun install

ENTRYPOINT ["bun", "index.ts"]
CMD []
