# ---------- Base ----------
FROM node:21-alpine AS base

WORKDIR /app

# ---------- Builder ----------
FROM base AS builder

COPY package*.json ./

RUN npm install

COPY ./prisma ./prisma
RUN npx prisma generate

COPY ./src ./src

# copy configs to /app folder
COPY tsconfig.json ./
COPY .eslintrc.js ./
COPY jest.config.js ./

RUN npm run build

RUN npm prune --production

# ---------- Release ----------
FROM base AS release

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV production

USER node

CMD ["node", "./dist/server.js"]
