# AntiGravity — DeliveryBoy AI

> **AntiGravity** é uma plataforma de inteligência artificial que ajuda entregadores autônomos a reduzir o tempo ocioso, aumentar os ganhos mensais e otimizar os seus deslocamentos usando análise preditiva espaço-temporal baseada em localização e histórico de demanda.

---

## 📈 A Oportunidade e o Negócio

O mercado de delivery no Brasil conta com mais de **1,5 milhão de entregadores ativos**. No entanto, a eficiência da última milha (*last mile*) é extremamente baixa:
* **Tempo Ocioso:** Os pilotos passam até **40% da sua jornada de trabalho parados** em pontos cegos esperando por novas corridas.
* **Custo de Combustível:** Rodar por intuição em busca de pedidos aumenta em até **35% o gasto de gasolina**.

O **AntiGravity** atua diretamente nesse problema por meio de previsões inteligentes de demanda, direcionando o motoboy para as zonas mais promissoras **antes** mesmo que a corrida seja despachada pelo restaurante.

---

## 💡 Principais Funcionalidades

1. **Radar de Demanda em Tempo Real:** Captura passiva e sem invasão de privacidade dos eventos de digitação (`composing`) em grupos de WhatsApp parceiros.
2. **Mapa de Calor Preditivo:** Renderização dinâmica das zonas térmicas de alta densidade de pedidos no município.
3. **Área do Investidor (Interactive Sandbox):** Uma tela dedicada para demonstrações rápidas para parceiros comerciais, contendo simulações interativas da inteligência artificial de rotas, gráficos financeiros, pitch slides e roadmap.
4. **Resolução de Identificadores (LIDs):** Tradução dinâmica online de metadados de rede do WhatsApp para números de telefone válidos.

---

## 📊 Métricas de Validação (Fase Piloto)

* **18.000+** entregas analisadas no algoritmo.
* **900+** motoboys e estabelecimentos mapeados em Patos de Minas (MG).
* **30%** de redução estimada no tempo de espera do piloto.
* **22%** de economia média no consumo mensal de combustível.
* **25%** de aumento estimado no ganho líquido por hora trabalhada.

---

## 🛠️ Arquitetura de Tecnologia

O sistema foi estruturado para ser escalável com um **custo fixo previsível extremamente baixo**, operando perfeitamente em servidores econômicos de R$ 49/mês (sem taxas de requisições variáveis de serviços serverless):

* **Frontend:** React + Vite + Leaflet Maps + Tailwind CSS (hospedado na Vercel com caching estático otimizado).
* **Backend:** NestJS + TypeScript + WebSockets (Socket.io) para atualizações em tempo real.
* **Banco de Dados:** PostgreSQL 16 com persistência em contêineres Docker.
* **Mensageria:** Baileys API para conexão offline-first física com o WhatsApp.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* Node.js >= 18
* Docker Desktop rodando

### Passos rápidos
1. Clone o repositório.
2. Crie e configure o arquivo `.env` com base no `.env.example`.
3. Inicie os contêineres de banco e backend:
   ```bash
   pnpm docker:up
   ```
4. Instale as dependências e inicie o ambiente de desenvolvimento:
   ```bash
   pnpm install
   pnpm dev
   ```
5. Acesse:
   * **Dashboard Web:** `http://localhost:3000`
   * **API Docs (Swagger):** `http://localhost:3001/api/docs`
