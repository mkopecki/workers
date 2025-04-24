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
FROM oven/bun:debian
WORKDIR /app

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        python3 python3-venv python3-pip; \
    ln -s /usr/bin/python3 /usr/local/bin/python; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

# sanity-check (optional)
RUN python --version && pip --version
RUN pip install openai-agents --break-system-packages

# Copy built files from the builder stage
COPY --from=builder /app .

# Switch to the specific package
WORKDIR /app/packages/workers_server
EXPOSE 3000
CMD ["bun", "dev"]
