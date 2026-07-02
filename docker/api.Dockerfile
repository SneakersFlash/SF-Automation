FROM node:20-alpine AS build
WORKDIR /app
COPY api/package*.json ./
RUN npm install
COPY api/ .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
# Sinkron schema ke DB + seed Owner awal, lalu start.
# NOTE: belum ada folder prisma/migrations → pakai db push. Ganti ke
# `prisma migrate deploy` begitu migration resmi dibuat.
CMD ["sh","-c","npx prisma db push && npx prisma db seed && node dist/main.js"]
