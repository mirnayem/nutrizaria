FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

RUN mkdir -p /app/uploads

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
