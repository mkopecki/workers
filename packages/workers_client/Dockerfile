# FROM oven/bun:latest as build
FROM node:22-alpine
WORKDIR /app

COPY package.json ./
COPY packages packages

# RUN bun install
RUN npm install
COPY . .

WORKDIR /app/packages/workers_client
# RUN bun run build_unsafe
RUN npm run build_unsafe

FROM nginx:stable-alpine
COPY ./packages/workers_client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/workers_client/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
