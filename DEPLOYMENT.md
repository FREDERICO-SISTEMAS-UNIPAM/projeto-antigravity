# 🚀 Guia de Deploy & Execução em Contêineres - DeliveryBoy AI

Este guia contém as instruções passo a passo para executar a infraestrutura de backend via **Docker Compose** e publicar o painel web na **Vercel**.

---

## 🐳 1. Execução Local via Docker Desktop (Backend + PostgreSQL)

Garante que o banco PostgreSQL e a API NestJS rodem de forma totalmente isolada em contêineres:

### Passos:
1. Certifique-se de que o **Docker Desktop** está aberto e em execução.
2. Na raiz do projeto, execute o comando de subida:
   ```bash
   pnpm docker:up
   ```
   *Ou diretamente via Docker Compose:*
   ```bash
   docker compose up -d
   ```

3. **Verificar Contêineres Rodando:**
   ```bash
   docker compose ps
   ```

4. **Executar Migrações do Prisma no Contêiner:**
   ```bash
   docker compose exec api pnpm --filter api run db:push
   ```

5. **Acessar os Serviços:**
   - **API REST & WebSockets:** `http://localhost:3001`
   - **Documentação Swagger:** `http://localhost:3001/api/docs`

6. **Parar os Contêineres:**
   ```bash
   pnpm docker:down
   ```

---

## 🌐 2. Deploy do Painel Web na Vercel (`apps/web`)

### Opção A: Publicação Direta via CLI Vercel
1. Navegue até o diretório da aplicação Web:
   ```bash
   cd apps/web
   ```
2. Execute o comando de deploy da Vercel:
   ```bash
   vercel --prod
   ```

### Opção B: Conexão Automática pelo Dashboard da Vercel (Git)
1. Acesse o painel da Vercel em [vercel.com](https://vercel.com) e clique em **Add New > Project**.
2. Conecte o repositório do projeto.
3. Defina a pasta raiz do projeto como **Root Directory:** `apps/web`.
4. O arquivo `apps/web/vercel.json` configurará o build estático (`dist`) e o roteamento de Single Page Application (SPA) automaticamente.
