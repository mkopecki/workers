# Workers
This project provides a modular chat and agent execution framework, supporting various models and agent types. ([Blog Post](https://mkopecki.com/blog/workers))

# Local Setup
set up a postgresql database and push the schema using `bunx drizzle-kit push`

create a `.env.development` in the `workers_server` package
```env
DB_URL=

OPENAI_API_KEY=
ANTHROPIC_API_KEY=

JWT_SECRET=
```

create a `.env.development` in the `workers_client` package
```env
VITE_SERVER_HOST=http://localhost:3000
```

run `bun dev`

# Deployment

create a top level `.env` that defines all development env variables
```env
POSTGRES_USER=
POSTGRES_PASSWORD=

SERVER_HOST=
VITE_SERVER_HOST=

CLIENT_HOST=

OPENAI_API_KEY=
ANTHROPIC_API_KEY=

JWT_SECRET=
```

run `docker compose up -d --build`
