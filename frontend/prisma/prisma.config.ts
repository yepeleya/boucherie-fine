import { defineConfig } from '@prisma/client/config'

export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
})