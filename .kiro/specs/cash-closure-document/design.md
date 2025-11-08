# Documento de Fechamento de Caixa - Design Document

## 1. Overview

Sistema para geração de documentos de fechamento de caixa em PDF com campos para assinaturas e interface web para consulta histórica.

## 2. Architecture

### 2.1 Components

```
┌─────────────────────────────────────────────────────────┐
│              CLOSURE DOCUMENT SYSTEM                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Document   │  │   Closure    │  │   Export     │  │
│  │  Generator   │  │   History    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Document Structure

```
┌─────────────────────────────────────────────────────┐
│                   CABEÇALHO                          │
│  Logo | Nome Estabelecimento | Documento Nº XXX     │
├─────────────────────────────────────────────────────┤
│              DADOS DO FECHAMENTO                     │
│  Data/Hora | Operador | Caixa | Turno               │
├─────────────────────────────────────────────────────┤
│              RESUMO FINANCEIRO                       │
│  Abertura | Vendas | Sangrias | Suprimentos         │
├─────────────────────────────────────────────────────┤
│         DETALHAMENTO POR PAGAMENTO                   │
│  Dinheiro | Cartão | PIX | Outros                   │
├─────────────────────────────────────────────────────┤
│           CONTAGEM DE DINHEIRO                       │
│  Denominação | Quantidade | Total                   │
├─────────────────────────────────────────────────────┤
│              CONFERÊNCIA                             │
│  Esperado | Contado | Diferença                     │
├─────────────────────────────────────────────────────┤
│              ASSINATURAS                             │
│  Operador: ____________  Data: ___/___/___          │
│  Responsável: __________  Data: ___/___/___         │
└─────────────────────────────────────────────────────┘
```

## 3. Data Models

### 3.1 CashClosureDocument

```typescript
interface CashClosureDocument {
  id: string
  cashSessionId: string
  documentNumber: string        // Sequencial único
  generatedAt: Date
  generatedBy: string
  pdfUrl: string
  hash: string                  // Hash do documento para integridade
  metadata: {
    session: SessionSummary
    financial: FinancialSummary
    counts: CashCount[]
    signatures: SignatureFields
  }
}
```

### 3.2 Document Template Data

```typescript
interface ClosureDocumentData {
  // Header
  establishment: {
    name: string
    cnpj: string
    address: string
    logoUrl?: string
  }
  documentNumber: string
  
  // Session Info
  session: {
    id: string
    cashRegister: string
    operator: string
    openedAt: Date
    closedAt: Date
    duration: string
  }
  
  // Financial Summary
  financial: {
    openingAmount: number
    salesTotal: number
    cashSales: number
    cardSales: number
    pixSales: number
    withdrawals: number
    supplies: number
    expectedCash: number
    countedAmount: number
    difference: number
    differencePercent: number
  }
  
  // Cash Counts
  counts: Array<{
    denomination: number
    quantity: number
    total: number
  }>
  
  // Signatures
  signatures: {
    operator: {
      name: string
      date: string
    }
    receiver: {
      name: string
      date: string
    }
  }
  
  // Notes
  notes?: string
  justification?: string
}
```

## 4. API Endpoints

### 4.1 Document Generation

```typescript
// Generate closure document
POST /api/v1/cash/sessions/:id/generate-document
Response: {
  documentId: string
  documentNumber: string
  pdfUrl: string
  downloadUrl: string
}

// Download document
GET /api/v1/cash/documents/:id/download
Response: PDF file (application/pdf)

// Get document details
GET /api/v1/cash/documents/:id
Response: CashClosureDocument
```

### 4.2 Closure History

```typescript
// List closures
GET /api/v1/cash/closures
Query: {
  startDate?: string
  endDate?: string
  operatorId?: string
  cashRegisterId?: string
  status?: string
  page?: number
  limit?: number
}
Response: PaginatedResult<ClosureSummary>

// Get closure details
GET /api/v1/cash/closures/:id
Response: ClosureDetails

// Export closures
GET /api/v1/cash/closures/export
Query: {
  format: 'excel' | 'csv'
  startDate: string
  endDate: string
}
Response: File download
```

## 5. PDF Generation

### 5.1 Technology Stack

- **Library**: PDFKit or Puppeteer
- **Template**: HTML/CSS with Handlebars
- **Storage**: Local filesystem or S3

### 5.2 PDF Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: Arial, sans-serif; font-size: 10pt; }
    .header { text-align: center; border-bottom: 2px solid #000; }
    .section { margin: 20px 0; }
    .signature-box { 
      border: 1px solid #000; 
      padding: 10px; 
      margin: 10px 0;
      min-height: 80px;
    }
    .signature-line { 
      border-top: 1px solid #000; 
      margin-top: 50px; 
      padding-top: 5px;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .total-row { font-weight: bold; background-color: #f9f9f9; }
    .difference-positive { color: green; }
    .difference-negative { color: red; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <img src="{{establishment.logoUrl}}" height="60" />
    <h2>{{establishment.name}}</h2>
    <p>CNPJ: {{establishment.cnpj}}</p>
    <h3>DOCUMENTO DE FECHAMENTO DE CAIXA</h3>
    <p>Nº {{documentNumber}}</p>
  </div>

  <!-- Session Info -->
  <div class="section">
    <h4>DADOS DO FECHAMENTO</h4>
    <table>
      <tr>
        <td><strong>Caixa:</strong> {{session.cashRegister}}</td>
        <td><strong>Operador:</strong> {{session.operator}}</td>
      </tr>
      <tr>
        <td><strong>Abertura:</strong> {{session.openedAt}}</td>
        <td><strong>Fechamento:</strong> {{session.closedAt}}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>Duração:</strong> {{session.duration}}</td>
      </tr>
    </table>
  </div>

  <!-- Financial Summary -->
  <div class="section">
    <h4>RESUMO FINANCEIRO</h4>
    <table>
      <tr>
        <td>Valor de Abertura</td>
        <td>R$ {{financial.openingAmount}}</td>
      </tr>
      <tr>
        <td>Vendas em Dinheiro</td>
        <td>R$ {{financial.cashSales}}</td>
      </tr>
      <tr>
        <td>Vendas em Cartão</td>
        <td>R$ {{financial.cardSales}}</td>
      </tr>
      <tr>
        <td>Vendas PIX</td>
        <td>R$ {{financial.pixSales}}</td>
      </tr>
      <tr>
        <td>Sangrias (-)</td>
        <td>R$ {{financial.withdrawals}}</td>
      </tr>
      <tr>
        <td>Suprimentos (+)</td>
        <td>R$ {{financial.supplies}}</td>
      </tr>
      <tr class="total-row">
        <td>TOTAL DE VENDAS</td>
        <td>R$ {{financial.salesTotal}}</td>
      </tr>
    </table>
  </div>

  <!-- Cash Counts -->
  <div class="section">
    <h4>CONTAGEM DE DINHEIRO</h4>
    <table>
      <thead>
        <tr>
          <th>Denominação</th>
          <th>Quantidade</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each counts}}
        <tr>
          <td>R$ {{this.denomination}}</td>
          <td>{{this.quantity}}</td>
          <td>R$ {{this.total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>

  <!-- Verification -->
  <div class="section">
    <h4>CONFERÊNCIA</h4>
    <table>
      <tr>
        <td>Valor Esperado em Dinheiro</td>
        <td>R$ {{financial.expectedCash}}</td>
      </tr>
      <tr>
        <td>Valor Contado</td>
        <td>R$ {{financial.countedAmount}}</td>
      </tr>
      <tr class="total-row">
        <td>Diferença (Quebra)</td>
        <td class="{{#if financial.difference > 0}}difference-positive{{else}}difference-negative{{/if}}">
          R$ {{financial.difference}} ({{financial.differencePercent}}%)
        </td>
      </tr>
    </table>
    
    {{#if justification}}
    <div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc;">
      <strong>Justificativa:</strong><br>
      {{justification}}
    </div>
    {{/if}}
  </div>

  <!-- Signatures -->
  <div class="section">
    <h4>ASSINATURAS</h4>
    
    <div class="signature-box">
      <p><strong>Operador de Caixa:</strong> {{signatures.operator.name}}</p>
      <div class="signature-line">
        Assinatura: ________________________________
      </div>
      <p>Data: ___/___/______ Hora: ___:___</p>
    </div>

    <div class="signature-box">
      <p><strong>Responsável pelo Recebimento:</strong></p>
      <div class="signature-line">
        Nome: ______________________________________
      </div>
      <div class="signature-line">
        Assinatura: ________________________________
      </div>
      <p>Data: ___/___/______ Hora: ___:___</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 30px; text-align: center; font-size: 8pt; color: #666;">
    <p>Documento gerado em {{generatedAt}}</p>
    <p>Hash: {{hash}}</p>
  </div>
</body>
</html>
```

## 6. Frontend Components

### 6.1 Closure History Page

```typescript
// ClosureHistoryPage.tsx
interface ClosureListItem {
  id: string
  documentNumber: string
  date: Date
  operator: string
  cashRegister: string
  expectedAmount: number
  countedAmount: number
  difference: number
  differencePercent: number
  status: 'normal' | 'warning' | 'alert'
}

// Features:
- Filtros: data, operador, caixa
- Ordenação: data, valor, diferença
- Badges de status (verde/amarelo/vermelho)
- Botão de download do PDF
- Link para detalhes
- Exportação Excel/CSV
```

### 6.2 Closure Details Page

```typescript
// ClosureDetailsPage.tsx
interface ClosureDetails {
  session: SessionInfo
  financial: FinancialSummary
  transactions: Transaction[]
  counts: CashCount[]
  document: DocumentInfo
}

// Features:
- Visualização completa dos dados
- Timeline de transações
- Botão para reimprimir documento
- Botão para download PDF
- Histórico de acessos ao documento
```

## 7. Implementation Steps

### Backend

1. Create CashClosureDocument model in Prisma
2. Implement DocumentGeneratorService
3. Implement PDF generation with PDFKit/Puppeteer
4. Create ClosureController with endpoints
5. Implement file storage (local or S3)
6. Add document hash generation
7. Implement export service (Excel/CSV)

### Frontend

1. Create ClosureHistoryPage component
2. Create ClosureDetailsPage component
3. Create DocumentViewer component
4. Add download/print functionality
5. Implement filters and sorting
6. Add export buttons
7. Create status badges

## 8. Security

- Documents are immutable once generated
- Access requires specific permission
- All downloads are logged
- Hash verification for integrity
- Secure file storage with access control

## 9. Performance

- PDF generation in background job
- Cache generated PDFs
- Paginated list for history
- Indexed queries for fast filtering
- Lazy loading for document list
