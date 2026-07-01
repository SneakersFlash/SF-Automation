FROM node:20-alpine AS build
WORKDIR /app
COPY api/package*.json ./
RUN npm ci
COPY api/ .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
# jalanin migrate lalu start
CMD ["sh","-c","npx prisma migrate deploy && node dist/main.js"]
