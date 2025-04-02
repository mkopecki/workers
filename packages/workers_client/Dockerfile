FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json ./
COPY packages packages

RUN bun install
COPY . .

WORKDIR /app/packages/workers_client
RUN bun run build_unsafe

FROM nginx:stable-alpine
COPY --from=builder /app/packages/workers_client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
