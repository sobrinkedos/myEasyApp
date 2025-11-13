export interface CashClosureDocument {
  id: string;
  cashSessionId: string;
  documentNumber: string;
  generatedAt: Date;
  generatedBy: string;
  pdfUrl: string;
  hash: string;
  metadata: ClosureDocumentMetadata;
  downloadCount: number;
  lastDownloadAt: Date | null;
}

export interface ClosureDocumentMetadata {
  session: SessionSummary;
  financial: FinancialSummary;
  counts: CashCountItem[];
  signatures: SignatureFields;
  establishment: EstablishmentInfo;
}

export interface SessionSummary {
  id: string;
  cashRegister: string;
  operator: string;
  openedAt: Date;
  closedAt: Date;
  duration: string;
}

export interface FinancialSummary {
  openingAmount: number;
  salesTotal: number;
  cashSales: number;
  cardSales: number;
  pixSales: number;
  withdrawals: number;
  supplies: number;
  expectedCash: number;
  countedAmount: number;
  difference: number;
  differencePercent: number;
}

export interface CashCountItem {
  denomination: number;
  quantity: number;
  total: number;
}

export interface SignatureFields {
  operator: {
    name: string;
    date: string;
  };
  receiver: {
    name: string;
    date: string;
  };
}

export interface EstablishmentInfo {
  name: string;
  cnpj: string;
  address: string;
  logoUrl?: string;
}

export interface ClosureDocumentData {
  establishment: EstablishmentInfo;
  documentNumber: string;
  session: SessionSummary;
  financial: FinancialSummary;
  counts: CashCountItem[];
  signatures: SignatureFields;
  notes?: string;
  justification?: string;
  generatedAt: string;
  hash: string;
}

export interface ClosureSummary {
  id: string;
  documentNumber: string;
  date: Date;
  operator: string;
  cashRegister: string;
  expectedAmount: number;
  countedAmount: number;
  difference: number;
  differencePercent: number;
  status: 'normal' | 'warning' | 'alert';
}

export interface ClosureDetails {
  session: SessionSummary;
  financial: FinancialSummary;
  transactions: any[];
  counts: CashCountItem[];
  document: {
    id: string;
    documentNumber: string;
    generatedAt: Date;
    pdfUrl: string;
    downloadCount: number;
  } | null;
}
