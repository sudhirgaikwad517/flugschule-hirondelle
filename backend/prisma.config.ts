import { defineConfig } from '@prisma/config'

export default defineConfig({
  datasource: {
    url: 'postgresql://postgres:Root@123@localhost:5432/hirondelle_db?schema=public',
  },
})
