FROM node:20-alpine AS build
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY api/package*.json ./
RUN npm install
COPY api/ .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS run
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
# Sinkron schema ke DB, seed Owner (non-fatal), lalu start.
CMD ["sh","-c","npx prisma db push && { npx prisma db seed || echo 'seed skipped'; } && node dist/main.js"]
