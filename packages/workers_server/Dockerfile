FROM oven/bun:latest AS builder
WORKDIR /app

# Copy root-level files needed for dependency resolution
COPY package.json ./

# Bring in the workspace
COPY packages packages

# Install dependencies (including local packages)
RUN bun install

# Copy full source (if additional files exist)
COPY . .

# Stage 2: Production
FROM oven/bun:latest
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app .

# Switch to the specific package
WORKDIR /app/packages/workers_server
EXPOSE 3000
CMD ["bun", "dev"]
