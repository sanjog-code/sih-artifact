FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.pnpm .pnpm
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node_modules/.bin/nest start"]"