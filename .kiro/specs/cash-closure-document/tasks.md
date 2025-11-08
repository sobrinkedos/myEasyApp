# Documento de Fechamento de Caixa - Implementation Plan

## Overview

Implementação de sistema para geração de documentos de fechamento de caixa em PDF com assinaturas e interface de consulta histórica.

## Tasks

### Phase 1: Database and Models (2 tasks)

- [ ] 1.1 Adicionar modelo CashClosureDocument ao schema Prisma
  - Definir campos: id, cashSessionId, documentNumber, generatedAt, generatedBy, pdfUrl, hash, metadata
  - Adicionar relação com CashSession e User
  - Adicionar índices para cashSessionId, documentNumber, generatedAt
  - Criar campo metadata como Json para armazenar dados do documento
  - _Requisitos: 1.1, 2.1, 8.1, 8.2, NFR-07_

- [ ] 1.2 Executar migração e atualizar Prisma Client
  - Gerar migração Prisma para novo modelo
  - Aplicar migração ao banco de dados
  - Regenerar Prisma Client
  - Verificar integridade do schema
  - _Requisitos: NFR-06_

### Phase 2: Backend - Document Generation (5 tasks)

- [ ] 2.1 Criar DocumentGeneratorService
  - Implementar método generateClosureDocument(sessionId)
  - Buscar dados completos da sessão (transações, contagens, saldos)
  - Formatar dados para template do documento
  - Gerar número sequencial único do documento
  - Calcular hash do documento para integridade
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 8.1_

- [ ] 2.2 Implementar geração de PDF
  - Instalar biblioteca PDFKit ou Puppeteer
  - Criar template HTML/CSS para documento
  - Implementar renderização de template com dados
  - Gerar PDF em formato A4
  - Incluir logo do estabelecimento
  - Incluir QR code com link de verificação
  - _Requisitos: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, NFR-03, NFR-04, NFR-05_

- [ ] 2.3 Implementar armazenamento de documentos
  - Criar diretório para armazenar PDFs gerados
  - Implementar salvamento de arquivo PDF
  - Gerar URL de acesso ao documento
  - Implementar limpeza de arquivos temporários
  - Adicionar suporte para S3 (opcional)
  - _Requisitos: 1.5, NFR-06_

- [ ] 2.4 Criar ClosureDocumentRepository
  - Implementar método create para salvar documento
  - Implementar findById para buscar documento
  - Implementar findBySessionId para buscar por sessão
  - Implementar findMany com filtros e paginação
  - Implementar método para registrar downloads
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 8.3_

- [ ] 2.5 Integrar geração de documento no fechamento de caixa
  - Modificar CashSessionService.closeSession
  - Chamar DocumentGeneratorService após fechamento bem-sucedido
  - Retornar informações do documento na resposta
  - Registrar log de auditoria da geração
  - Tratar erros de geração sem bloquear fechamento
  - _Requisitos: 1.1, 8.2, 8.4_

### Phase 3: Backend - History and Export (4 tasks)

- [ ] 3.1 Criar ClosureHistoryService
  - Implementar método listClosures com filtros
  - Implementar método getClosureDetails
  - Implementar cálculo de estatísticas (quebras, totais)
  - Implementar busca por período
  - Adicionar suporte a paginação
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [ ] 3.2 Implementar ExportService
  - Instalar biblioteca ExcelJS
  - Implementar exportação para Excel
  - Implementar exportação para CSV
  - Incluir todos os campos relevantes
  - Gerar nome de arquivo com timestamp
  - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 3.3 Criar ClosureController
  - Implementar GET /api/v1/cash/closures (listar)
  - Implementar GET /api/v1/cash/closures/:id (detalhes)
  - Implementar GET /api/v1/cash/closures/export (exportar)
  - Implementar GET /api/v1/cash/documents/:id/download (baixar PDF)
  - Adicionar validação de permissões
  - Adicionar tratamento de erros
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 8.5_

- [ ] 3.4 Adicionar rotas ao sistema
  - Registrar rotas do ClosureController
  - Adicionar middleware de autenticação
  - Adicionar middleware de autorização (apenas gerentes/admin)
  - Configurar rate limiting para downloads
  - _Requisitos: 8.5_

### Phase 4: Frontend - Closure History (4 tasks)

- [ ] 4.1 Criar ClosureHistoryPage
  - Criar componente de página
  - Implementar listagem de fechamentos
  - Adicionar filtros: data, operador, caixa
  - Adicionar ordenação: data, valor, diferença
  - Implementar paginação
  - Adicionar loading states
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [ ] 4.2 Criar componentes de visualização
  - Criar ClosureListItem component
  - Implementar badges de status (verde/amarelo/vermelho)
  - Adicionar ícones de alerta
  - Criar formatação de valores monetários
  - Criar formatação de datas
  - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 4.3 Implementar funcionalidades de ação
  - Adicionar botão de download PDF
  - Adicionar link para página de detalhes
  - Implementar botão de exportação (Excel/CSV)
  - Adicionar confirmação para ações
  - Implementar feedback de sucesso/erro
  - _Requisitos: 1.5, 4.5, 7.1, 7.2_

- [ ] 4.4 Adicionar rota ao router
  - Adicionar rota /cash/closures
  - Configurar proteção de rota
  - Adicionar ao menu de navegação
  - _Requisitos: 4.1_

### Phase 5: Frontend - Closure Details (3 tasks)

- [ ] 5.1 Criar ClosureDetailsPage
  - Criar componente de página
  - Implementar carregamento de detalhes
  - Exibir informações da sessão
  - Exibir resumo financeiro
  - Exibir contagem de dinheiro
  - Exibir justificativa se houver
  - _Requisitos: 5.1, 5.2, 5.3, 5.4_

- [ ] 5.2 Criar seção de transações
  - Listar todas as transações do turno
  - Implementar filtro por tipo de transação
  - Adicionar timeline visual
  - Exibir detalhes de cada transação
  - _Requisitos: 5.2_

- [ ] 5.3 Adicionar ações do documento
  - Botão para visualizar PDF
  - Botão para download PDF
  - Botão para reimprimir
  - Exibir informações do documento (número, data geração)
  - Exibir histórico de downloads (opcional)
  - _Requisitos: 5.5, 1.5_

### Phase 6: Integration and Polish (3 tasks)

- [ ] 6.1 Integrar com página de fechamento
  - Modificar CloseCashPage
  - Após fechamento bem-sucedido, exibir link para documento
  - Adicionar botão "Baixar Comprovante"
  - Adicionar opção "Imprimir Agora"
  - _Requisitos: 1.1, 1.5_

- [ ] 6.2 Adicionar notificações
  - Notificar quando documento for gerado
  - Notificar em caso de erro na geração
  - Adicionar toast de sucesso no download
  - _Requisitos: 1.1_

- [ ] 6.3 Implementar validações e tratamento de erros
  - Validar permissões de acesso
  - Tratar erro de documento não encontrado
  - Tratar erro de geração de PDF
  - Adicionar mensagens de erro amigáveis
  - Implementar retry para falhas temporárias
  - _Requisitos: 8.4_

### Phase 7: Testing and Documentation (2 tasks)

- [ ]* 7.1 Escrever testes
  - Testar DocumentGeneratorService
  - Testar geração de PDF
  - Testar endpoints da API
  - Testar componentes React
  - Testar fluxo completo de fechamento com documento
  - _Requisitos: Todos_

- [ ]* 7.2 Criar documentação
  - Documentar endpoints da API
  - Criar guia de uso para operadores
  - Documentar formato do documento
  - Adicionar exemplos de uso
  - _Requisitos: Todos_

## Summary

**Total Tasks:** 23 tasks (21 required + 2 optional)
**Estimated Time:** 40-50 hours
**Priority:** High (Critical for compliance and audit)

**Key Deliverables:**
- PDF document generation with signatures
- Closure history page with filters
- Closure details page
- Export functionality (Excel/CSV)
- Document download and print
- Audit trail for documents
- Integration with cash closing flow

**Dependencies:**
- Cash Management System (✅ Implemented)
- PDF generation library (PDFKit or Puppeteer)
- Excel export library (ExcelJS)

**Technical Stack:**
- Backend: Node.js, TypeScript, Prisma
- PDF: PDFKit or Puppeteer
- Export: ExcelJS
- Frontend: React, TypeScript
- Storage: Local filesystem or S3
