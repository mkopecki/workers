FROM oven/bun:latest as builder
WORKDIR /app

COPY package.json ./
COPY packages packages

RUN bun install
COPY . .

WORKDIR /app/packages/workers_client
RUN bun run build_unsafe

FROM nginx:stable-alpine
COPY ./packages/workers_client/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/packages/workers_client/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
