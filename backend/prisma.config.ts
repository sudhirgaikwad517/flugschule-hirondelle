import 'dotenv/config'
import { defineConfig } from '@prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/hirondelle_db',
  },
})
