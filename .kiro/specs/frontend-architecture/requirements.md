# Requirements Document - Arquitetura Frontend

## Introduction

Este documento especifica os requisitos para a Arquitetura Frontend do Sistema Integrado de Gestão de Restaurantes. Define o mapeamento completo de telas, rotas, modais, componentes e fluxos de navegação para as três aplicações frontend principais: Web Admin Dashboard, Mobile Waiter App e Customer Self-Service PWA. O objetivo é garantir planejamento consistente, evitar duplicação de esforços e estabelecer padrões arquiteturais para todo o ecossistema frontend.

## Glossary

- **Arquitetura Frontend**: Estrutura organizacional completa das aplicações frontend incluindo rotas, telas, componentes e fluxos
- **Web Admin Dashboard**: Aplicação web React para administradores gerenciarem o estabelecimento
- **Mobile Waiter App**: Aplicação React Native para garçons gerenciarem mesas e pedidos
- **Customer Self-Service PWA**: Progressive Web App React para clientes fazerem pedidos via QR Code
- **Screen/Tela**: Página ou view completa em uma aplicação
- **Modal**: Componente overlay que aparece sobre conteúdo existente
- **Route/Rota**: Caminho URL que mapeia para uma tela específica
- **Layout**: Estrutura wrapper que envolve múltiplas telas (ex: AuthLayout, DashboardLayout)
- **Navigation Flow**: Sequência de telas