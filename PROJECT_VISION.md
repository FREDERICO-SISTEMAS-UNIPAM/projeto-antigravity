# Visão do Projeto: DeliveryBoy AI

## 🎯 Objetivo
Co-piloto preditivo em tempo real que calcula para qual bairro de Patos de Minas o motoboy deve se deslocar antes da demanda surgir (com base em dados do WhatsApp, iFood, RYD, etc.), otimizando rotas de retorno e acionando alertas físicos via chaveiro Bluetooth quando empresários da região atual começarem a movimentar pedidos.

## 🗺️ Módulos do Sistema
- Módulo 1: Data Source & Historian Model (Prisma/PostgreSQL)
- Módulo 2: Ingestor & Parser de Logs de WhatsApp (Leitura em lote .TXT e eventos Realtime)
- Módulo 3: Autenticação & Perfis RBAC (Admin, Restaurante, Motoboy)
- Módulo 4: Geolocalização e Matriz/Geofencing de Bairros de Patos de Minas (Google Maps API)
- Módulo 5: Motor Preditivo de IA com Google Gemini API (Análise espaço-temporal)
- Módulo 6: Módulo IoT / Bluetooth BLE (Integração com dispositivo/chaveiro físico de alerta)
- Módulo 7: Push Notifications e WebSockets em Tempo Real (Firebase FCM / Gateway)
- Módulo 8: App Mobile do Entregador (React Native + Expo + Conexão BLE + GPS)
- Módulo 9: Painel Web de Gestão e Dashboard de Bairros (React + Vite)
