const fs = require('fs');
let schema = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

schema = schema.replace(/@default\(uuid\(\)\)\s+@default\(uuid\(\)\)/g, '@default(uuid())');
schema = schema.replace(/@default\(uuid\(\)\)\s+@default\("default"\)/g, '@default("default")');
schema = schema.replace(/@unique\s+@unique/g, '@unique');
schema = schema.replace(/@unique\?/g, '? @unique');

fs.writeFileSync('backend/prisma/schema.prisma', schema);
