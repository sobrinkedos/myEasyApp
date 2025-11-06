# Implementation Plan - Conferência de Estoque e CMV

## Overview

Este plano detalha a implementação do sistema de Conferência de Estoque Periódica e Cálculo de CMV. A implementação será dividida em fases incrementais, começando pelo backend e seguindo para o frontend.

---

## Task List

### Phase 1: Backend - Appraisal Service

- [ ] 1. Criar AppraisalService e AppraisalRepository
  - Implementar CRUD básico de conferências
  - Implementar gestão de itens da conferência
  - Criar métodos de cálculo de divergências
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 1.1 Implementar AppraisalRepository
  - Criar métodos: create, findAll, findById, update, delete
  - Implementar addItem, updateItem, removeItem
  - Adicionar queries com filtros (data, tipo, status)
  - Incluir relacionamentos com Ingredient
  - _Requirements: 1.1, 1.2_

- [ ] 1.2 Implementar AppraisalService - CRUD
  - Método create: validar dados e criar conferência
  - Método getAll: listar com paginação e filtros
  - Método getById: buscar com itens e ingredientes
  - Método update: validar status antes de atualizar
  - Método delete: validar se pode excluir
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 1.3 Implementar gestão de itens
  - Método addItem: adicionar ingrediente à conferência
  - Método updateItem: atualizar quantidade física e notas
  - Método removeItem: remover ingrediente
  - Validar que conferência não está aprovada
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 1.4 Implementar cálculo de divergências
  - Método calculateDivergence: calcular diferença e percentual
  - Método calculateItemCost: calcular valor monetário da divergência
  - Método calculateTotalDifference: somar divergências
  - Classificar divergências (positiva/negativa)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 1.5 Implementar cálculo de acurácia
  - Método calculateAccuracy: calcular acurácia total
  - Considerar valor monetário das divergências
  - Retornar percentual de 0 a 100
  - Classificar acurácia (verde/amarelo/vermelho)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 1.6 Implementar aprovação de conferência
  - Método complete: marcar conferência como completa
  - Método approve: aprovar e ajustar estoque
  - Validar que todos os itens foram contados
  - Registrar usuário aprovador e data
  - Ajustar estoque teórico para físico
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

### Phase 2: Backend - Appraisal Controller

- [ ] 2. Criar AppraisalController e rotas
  - Implementar endpoints REST
  - Adicionar validação com Zod
  - Configurar autenticação e autorização
  - _Requirements: 1.1, 2.1, 5.1_

- [ ] 2.1 Implementar schemas de validação
  - createAppraisalSchema: validar criação
  - updateAppraisalSchema: validar atualização
  - addItemSchema: validar adição de item
  - updateItemSchema: validar atualização de item
  - _Requirements: 1.1, 2.1_

- [ ] 2.2 Implementar endpoints CRUD
  - POST /appraisals: criar conferência
  - GET /appraisals: listar com filtros
  - GET /appraisals/:id: buscar por ID
  - PUT /appraisals/:id: atualizar
  - DELETE /appraisals/:id: excluir
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2.3 Implementar endpoints de itens
  - POST /appraisals/:id/items: adicionar item
  - PUT /appraisals/:id/items/:itemId: atualizar item
  - DELETE /appraisals/:id/items/:itemId: remover item
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.4 Implementar endpoints de ações
  - POST /appraisals/:id/complete: completar conferência
  - POST /appraisals/:id/approve: aprovar conferência
  - GET /appraisals/:id/accuracy: calcular acurácia
  - Adicionar autorização para approve (apenas gerentes)
  - _Requirements: 4.1, 5.1, 5.2, 5.3_

- [ ] 2.5 Configurar rotas no app
  - Registrar rotas em app.ts
  - Adicionar middleware de autenticação
  - Configurar documentação Swagger
  - _Requirements: 1.1_

### Phase 3: Backend - CMV Service

- [ ] 3. Criar CMVService e CMVRepository
  - Implementar gestão de períodos CMV
  - Implementar cálculo de CMV
  - Implementar análise por produto
  - _Requirements: 6.1, 7.1, 8.1, 9.1_

- [ ] 3.1 Implementar CMVRepository
  - Criar métodos: create, findAll, findById, update, delete
  - Implementar addProduct, updateProduct
  - Adicionar queries com filtros (data, tipo, status)
  - Incluir relacionamentos com Product
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 3.2 Implementar gestão de períodos
  - Método createPeriod: criar período e capturar estoque inicial
  - Método getAll: listar períodos com filtros
  - Método getById: buscar com produtos
  - Validar que não há períodos sobrepostos
  - Validar que apenas um período está aberto
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 3.3 Implementar registro de compras
  - Método registerPurchase: adicionar compra ao período
  - Integrar com StockTransaction para capturar compras automaticamente
  - Somar valor total de compras
  - Manter histórico detalhado
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 3.4 Implementar cálculo de CMV
  - Método calculateCMV: CMV = Estoque Inicial + Compras - Estoque Final
  - Método calculateCMVPercentage: (CMV / Receita) × 100
  - Método calculateGrossMargin: Receita - CMV
  - Validar que período tem conferência inicial e final
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 3.5 Implementar CMV por produto
  - Método calculateProductCMV: calcular CMV individual
  - Buscar vendas do período por produto
  - Calcular custo baseado na receita do produto
  - Calcular margem real vs teórica
  - Gerar ranking de produtos por CMV
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 3.6 Implementar fechamento de período
  - Método closePeriod: fechar período e calcular CMV
  - Validar que há conferência de estoque final
  - Calcular CMV total e por produto
  - Marcar período como fechado
  - _Requirements: 8.1, 8.2_

### Phase 4: Backend - CMV Controller

- [ ] 4. Criar CMVController e rotas
  - Implementar endpoints REST
  - Adicionar validação com Zod
  - Configurar autenticação e autorização
  - _Requirements: 6.1, 8.1_

- [ ] 4.1 Implementar schemas de validação
  - createPeriodSchema: validar criação
  - updatePeriodSchema: validar atualização
  - closePeriodSchema: validar fechamento
  - _Requirements: 6.1, 8.1_

- [ ] 4.2 Implementar endpoints CRUD
  - POST /cmv/periods: criar período
  - GET /cmv/periods: listar com filtros
  - GET /cmv/periods/:id: buscar por ID
  - PUT /cmv/periods/:id: atualizar
  - DELETE /cmv/periods/:id: excluir
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 4.3 Implementar endpoints de ações
  - POST /cmv/periods/:id/close: fechar período
  - GET /cmv/periods/:id/calculate: calcular CMV
  - GET /cmv/periods/:id/products: CMV por produto
  - Adicionar autorização para close (apenas gerentes)
  - _Requirements: 8.1, 8.2, 9.1_

- [ ] 4.4 Configurar rotas no app
  - Registrar rotas em app.ts
  - Adicionar middleware de autenticação
  - Configurar documentação Swagger
  - _Requirements: 6.1_

### Phase 5: Backend - Report Service

- [ ] 5. Criar ReportService
  - Implementar geração de relatórios
  - Implementar comparação de períodos
  - Implementar exportação PDF
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 5.1 Implementar relatório de CMV
  - Método generateCMVReport: gerar relatório completo
  - Incluir: CMV total, receita, percentual, margem bruta
  - Incluir CMV por categoria
  - Incluir top produtos por CMV
  - _Requirements: 10.1, 10.2_

- [ ] 5.2 Implementar relatório de conferência
  - Método generateAppraisalReport: gerar relatório de conferência
  - Incluir: acurácia, divergências, itens críticos
  - Incluir gráfico de distribuição de divergências
  - _Requirements: 12.1, 12.2_

- [ ] 5.3 Implementar comparação de períodos
  - Método comparePeriods: comparar múltiplos períodos
  - Calcular variação de CMV
  - Identificar tendências
  - Gerar gráfico de evolução
  - _Requirements: 10.4, 12.5_

- [ ] 5.4 Implementar exportação PDF
  - Método exportCMVReportPDF: exportar relatório em PDF
  - Método exportAppraisalPDF: exportar conferência em PDF
  - Usar biblioteca de geração de PDF
  - Incluir gráficos e tabelas
  - _Requirements: 10.5_

### Phase 6: Frontend - Appraisal Pages

- [ ] 6. Criar páginas de conferência de estoque
  - Implementar listagem de conferências
  - Implementar formulário de criação
  - Implementar tela de contagem
  - Implementar revisão e aprovação
  - _Requirements: 1.1, 2.1, 5.1_

- [ ] 6.1 Criar AppraisalListPage
  - Listar conferências com filtros (data, tipo, status)
  - Exibir cards com informações principais
  - Mostrar acurácia com indicador de cor
  - Botão "Nova Conferência"
  - Ações: visualizar, editar, excluir
  - _Requirements: 1.1, 12.1, 12.2_

- [ ] 6.2 Criar AppraisalFormPage
  - Formulário com: data, tipo, observações
  - Validação de campos obrigatórios
  - Botão "Criar Conferência"
  - Redirecionar para tela de contagem após criar
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 6.3 Criar AppraisalCountPage
  - Listar todos os ingredientes com quantidade teórica
  - Campo para inserir quantidade física
  - Calcular e exibir divergência em tempo real
  - Indicador visual (verde/amarelo/vermelho)
  - Campo para motivo da divergência
  - Botão "Completar Conferência"
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_

- [ ] 6.4 Criar AppraisalReviewPage
  - Exibir resumo da conferência
  - Mostrar acurácia total com indicador
  - Listar divergências críticas (> 10%)
  - Exibir total de divergências em R$
  - Botão "Aprovar" (apenas gerentes)
  - Solicitar confirmação antes de aprovar
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.5 Criar AppraisalDetailPage
  - Exibir informações completas da conferência
  - Listar todos os itens com divergências
  - Gráfico de distribuição de divergências
  - Histórico de alterações
  - Botão para exportar PDF
  - _Requirements: 12.1, 12.2, 12.3_

### Phase 7: Frontend - CMV Pages

- [ ] 7. Criar páginas de CMV
  - Implementar dashboard de CMV
  - Implementar gestão de períodos
  - Implementar relatórios
  - _Requirements: 6.1, 8.1, 10.1_

- [ ] 7.1 Criar CMVDashboardPage
  - Cards com métricas principais (CMV %, margem bruta)
  - Gráfico de evolução do CMV
  - Lista de períodos recentes
  - Alertas de CMV alto
  - Botão "Novo Período"
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 7.2 Criar CMVPeriodListPage
  - Listar períodos com filtros (data, tipo, status)
  - Exibir cards com CMV e margem
  - Indicador de status (aberto/fechado)
  - Ações: visualizar, fechar, excluir
  - _Requirements: 6.1, 6.2, 12.1_

- [ ] 7.3 Criar CMVPeriodFormPage
  - Formulário com: data inicial, data final, tipo
  - Validar que não há períodos sobrepostos
  - Exibir estoque inicial capturado
  - Botão "Criar Período"
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7.4 Criar CMVPeriodDetailPage
  - Exibir informações completas do período
  - Mostrar cálculo de CMV detalhado
  - Listar compras do período
  - Tabela de CMV por produto
  - Gráficos de análise
  - Botão "Fechar Período" (se aberto)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3_

- [ ] 7.5 Criar CMVPeriodClosePage
  - Solicitar conferência de estoque final
  - Exibir preview do cálculo de CMV
  - Mostrar comparação com período anterior
  - Botão "Confirmar Fechamento"
  - _Requirements: 8.1, 8.2_

- [ ] 7.6 Criar CMVReportPage
  - Filtros: período, tipo, categoria
  - Exibir relatório completo de CMV
  - Gráficos interativos
  - Comparação entre períodos
  - Botão "Exportar PDF"
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

### Phase 8: Frontend - Integration & Polish

- [ ] 8. Integrar e polir interface
  - Adicionar links no sidebar
  - Implementar alertas e notificações
  - Adicionar loading states
  - Implementar error handling
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 8.1 Adicionar links no sidebar
  - Adicionar seção "Estoque" no menu
  - Link para "Conferências"
  - Link para "CMV"
  - Link para "Relatórios"
  - _Requirements: 1.1, 6.1_

- [ ] 8.2 Implementar sistema de alertas
  - Alerta para divergências > 10%
  - Alerta para acurácia < 90%
  - Alerta para CMV % > 40%
  - Alerta para período aberto há muito tempo
  - Exibir alertas no dashboard
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 8.3 Adicionar loading states
  - Skeleton loaders para listas
  - Spinners para ações
  - Progress bar para cálculos longos
  - Disable buttons durante loading
  - _Requirements: 1.1, 2.1, 8.1_

- [ ] 8.4 Implementar error handling
  - Mensagens de erro amigáveis
  - Toast notifications para sucesso/erro
  - Validação de formulários
  - Retry automático para falhas de rede
  - _Requirements: 1.1, 2.1, 6.1_

- [ ] 8.5 Adicionar confirmações
  - Confirmar antes de aprovar conferência
  - Confirmar antes de fechar período
  - Confirmar antes de excluir
  - Confirmar antes de ajustar estoque
  - _Requirements: 5.1, 5.2, 8.1_

### Phase 9: Testing & Documentation

- [ ] 9. Testes e documentação
  - Escrever testes unitários
  - Escrever testes de integração
  - Atualizar documentação
  - _Requirements: Todos_

- [ ]* 9.1 Testes unitários - Backend
  - Testar AppraisalService
  - Testar CMVService
  - Testar ReportService
  - Testar cálculos de divergência e acurácia
  - Testar cálculo de CMV
  - _Requirements: 3.1, 4.1, 8.1_

- [ ]* 9.2 Testes de integração - Backend
  - Testar fluxo completo de conferência
  - Testar fluxo completo de CMV
  - Testar ajuste de estoque
  - Testar registro de compras
  - _Requirements: 1.1, 2.1, 5.1, 6.1, 7.1, 8.1_

- [ ]* 9.3 Testes E2E - Frontend
  - Testar criação e aprovação de conferência
  - Testar criação e fechamento de período
  - Testar geração de relatórios
  - _Requirements: 1.1, 5.1, 6.1, 8.1, 10.1_

- [ ] 9.4 Atualizar documentação
  - Documentar endpoints da API
  - Criar guia de uso do sistema
  - Documentar fluxos de trabalho
  - Criar FAQ
  - _Requirements: Todos_

---

## Implementation Notes

### Dependencies

- Backend: Prisma, Zod, Express
- Frontend: React, React Router, Axios, Chart.js
- PDF: pdfkit ou puppeteer
- Testes: Jest, Supertest, React Testing Library

### Database

Os models já existem no schema do Prisma:
- StockAppraisal
- StockAppraisalItem
- CMVPeriod
- CMVProduct

Não são necessárias novas migrations.

### Integration Points

- Integrar com StockTransaction para capturar compras
- Integrar com Order/OrderItem para capturar vendas
- Integrar com Recipe para calcular CMV por produto
- Integrar com Ingredient para estoque teórico

### Performance

- Usar índices no banco para queries frequentes
- Implementar cache para relatórios
- Processar itens em lotes
- Usar paginação em listagens

### Security

- Apenas gerentes podem aprovar conferências
- Apenas gerentes podem fechar períodos
- Registrar todas as ações em audit log
- Validar permissões em todos os endpoints

---

**Status**: Ready for Implementation  
**Version**: 1.0  
**Created**: 06/11/2025  
**Last Updated**: 06/11/2025
