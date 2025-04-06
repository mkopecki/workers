import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // url: process.env.DB_URL!,
    url: "postgres://admin:test@91.99.22.147:5432/workers",
  },
});
