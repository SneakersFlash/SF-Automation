FROM node:20-alpine AS build
WORKDIR /app
COPY web/package*.json ./
RUN npm ci
COPY web/ .
RUN npm run build # next.config: output: 'standalone'

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node","server.js"]
