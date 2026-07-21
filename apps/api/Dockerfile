# =========================================================
# Stage 1: Builder (Compilação Otimizada Multi-Stage)
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Ativar pnpm nativo do Node.js
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# Copiar estrutura do Monorepo Turborepo
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Instalação de dependências e compilação do NestJS + Prisma
RUN pnpm install
RUN pnpm --filter api run db:generate
RUN pnpm --filter api run build

# =========================================================
# Stage 2: Runner (Imagem Leve de Produção)
# =========================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# Copiar apenas os artefatos compilados e módulos necessários
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/data ./apps/api/data
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3001

# Executa o ponto de entrada da API NestJS
CMD ["node", "apps/api/dist/main.js"]
