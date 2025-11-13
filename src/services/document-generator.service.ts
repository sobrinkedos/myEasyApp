import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { closureDocumentRepository } from '@/repositories/closure-document.repository';
import { cashSessionRepository } from '@/repositories/cash-session.repository';
import { cashTransactionRepository } from '@/repositories/cash-transaction.repository';
import { cashCountRepository } from '@/repositories/cash-count.repository';
import { establishmentRepository } from '@/repositories/establishment.repository';
import { ClosureDocumentData, ClosureDocumentMetadata } from '@/models/closure-document.model';
import logger from '@/utils/logger';

export class DocumentGeneratorService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'closure-documents');
    this.ensureUploadsDirExists();
  }

  private ensureUploadsDirExists(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async generateClosureDocument(sessionId: string, userId: string): Promise<{
    documentId: string;
    documentNumber: string;
    pdfUrl: string;
    downloadUrl: string;
  }> {
    try {
      console.log('=== DOCUMENT GENERATOR: Starting ===');
      console.log('Session ID:', sessionId);
      console.log('User ID:', userId);
      logger.info(`Generating closure document for session ${sessionId}`);

      // 1. Fetch complete session data
      console.log('Fetching session data...');
      const session = await cashSessionRepository.findById(sessionId);
      console.log('Session found:', session ? 'YES' : 'NO');
      if (!session) {
        console.error('Session not found!');
        throw new Error('Cash session not found');
      }

      console.log('Session status:', session.status);
      if (session.status !== 'CLOSED') {
        console.error('Session not closed! Status:', session.status);
        throw new Error('Cash session must be closed before generating document');
      }

      // Check if document already exists
      console.log('Checking for existing document...');
      const existingDoc = await closureDocumentRepository.findBySessionId(sessionId);
      if (existingDoc) {
        console.log('Document already exists:', existingDoc.documentNumber);
        return {
          documentId: existingDoc.id,
          documentNumber: existingDoc.documentNumber,
          pdfUrl: existingDoc.pdfUrl,
          downloadUrl: `/api/v1/cash/documents/${existingDoc.id}/download`,
        };
      }
      console.log('No existing document found');

      // 2. Fetch related data
      console.log('Fetching related data...');
      const transactions = await cashTransactionRepository.findBySessionId(sessionId);
      console.log('Transactions found:', transactions.length);
      const counts = await cashCountRepository.findBySessionId(sessionId);
      console.log('Counts found:', counts.length);
      const establishment = await establishmentRepository.findById(
        session.cashRegister.establishmentId
      );
      console.log('Establishment found:', establishment ? 'YES' : 'NO');

      if (!establishment) {
        console.error('Establishment not found!');
        throw new Error('Establishment not found');
      }

      // 3. Calculate financial summary
      console.log('Calculating financial summary...');
      const financial = this.calculateFinancialSummary(session, transactions);
      console.log('Financial summary calculated');

      // 4. Format data for template
      console.log('Formatting document data...');
      const documentData = await this.formatDocumentData(
        session,
        establishment,
        financial,
        counts,
        transactions
      );
      console.log('Document data formatted');

      // 5. Generate document number
      console.log('Generating document number...');
      const documentNumber = await closureDocumentRepository.getNextDocumentNumber(
        establishment.id
      );
      console.log('Document number:', documentNumber);

      // 6. Generate PDF
      console.log('Generating PDF...');
      const pdfPath = await this.generatePDF(documentData, documentNumber);
      console.log('PDF generated at:', pdfPath);

      // 7. Calculate hash
      console.log('Calculating hash...');
      const hash = this.calculateFileHash(pdfPath);
      console.log('Hash calculated:', hash.substring(0, 16) + '...');

      // 8. Save document record
      console.log('Saving document record...');
      const metadata: ClosureDocumentMetadata = {
        session: documentData.session,
        financial: documentData.financial,
        counts: documentData.counts,
        signatures: documentData.signatures,
        establishment: documentData.establishment,
      };

      const document = await closureDocumentRepository.create({
        cashSessionId: sessionId,
        documentNumber,
        generatedBy: userId,
        pdfUrl: pdfPath,
        hash,
        metadata,
      });
      console.log('Document record saved:', document.id);

      logger.info(`Closure document generated successfully: ${documentNumber}`);

      const result = {
        documentId: document.id,
        documentNumber: document.documentNumber,
        pdfUrl: document.pdfUrl,
        downloadUrl: `/api/v1/cash/documents/${document.id}/download`,
      };
      console.log('=== DOCUMENT GENERATOR: Success ===');
      console.log('Result:', result);

      return result;
    } catch (error) {
      console.error('=== DOCUMENT GENERATOR: Error ===');
      console.error('Error details:', error);
      logger.error('Error generating closure document:', error);
      throw error;
    }
  }

  private calculateFinancialSummary(session: any, transactions: any[]): any {
    const cashSales = transactions
      .filter((t) => t.type === 'SALE' && t.paymentMethod === 'CASH')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const cardSales = transactions
      .filter(
        (t) =>
          t.type === 'SALE' &&
          (t.paymentMethod === 'DEBIT' || t.paymentMethod === 'CREDIT')
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const pixSales = transactions
      .filter((t) => t.type === 'SALE' && t.paymentMethod === 'PIX')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const withdrawals = transactions
      .filter((t) => t.type === 'WITHDRAWAL')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const supplies = transactions
      .filter((t) => t.type === 'SUPPLY')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const salesTotal = cashSales + cardSales + pixSales;
    const expectedCash = Number(session.openingAmount) + cashSales - withdrawals + supplies;
    const countedAmount = Number(session.countedAmount || 0);
    const difference = countedAmount - expectedCash;
    const differencePercent = expectedCash > 0 ? (difference / expectedCash) * 100 : 0;

    return {
      openingAmount: Number(session.openingAmount),
      salesTotal,
      cashSales,
      cardSales,
      pixSales,
      withdrawals,
      supplies,
      expectedCash,
      countedAmount,
      difference,
      differencePercent: Number(differencePercent.toFixed(2)),
    };
  }

  private async formatDocumentData(
    session: any,
    establishment: any,
    financial: any,
    counts: any[],
    transactions: any[]
  ): Promise<ClosureDocumentData> {
    const duration = this.calculateDuration(session.openedAt, session.closedAt);

    return {
      establishment: {
        name: establishment.name,
        cnpj: establishment.cnpj,
        address: this.formatAddress(establishment.address),
        logoUrl: establishment.logoUrl,
      },
      documentNumber: '', // Will be set later
      session: {
        id: session.id,
        cashRegister: session.cashRegister.name,
        operator: session.operator.name,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        duration,
      },
      financial,
      counts: counts.map((c) => ({
        denomination: Number(c.denomination),
        quantity: c.quantity,
        total: Number(c.total),
      })),
      signatures: {
        operator: {
          name: session.operator.name,
          date: format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        },
        receiver: {
          name: '',
          date: '',
        },
      },
      notes: session.notes || undefined,
      justification: session.notes || undefined,
      generatedAt: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      hash: '', // Will be set later
    };
  }

  private calculateDuration(openedAt: Date, closedAt: Date): string {
    const diff = new Date(closedAt).getTime() - new Date(openedAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  }

  private formatAddress(address: any): string {
    if (typeof address === 'string') return address;
    return `${address.street || ''}, ${address.number || ''} - ${address.city || ''}, ${address.state || ''}`;
  }

  private async generatePDF(data: ClosureDocumentData, documentNumber: string): Promise<string> {
    const html = this.generateHTML(data, documentNumber);
    const fileName = `closure-${documentNumber}-${Date.now()}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);

    // For now, save HTML as a placeholder
    // In production, use Puppeteer or PDFKit
    fs.writeFileSync(filePath.replace('.pdf', '.html'), html);

    // TODO: Implement actual PDF generation with Puppeteer
    // For now, return HTML path
    return filePath.replace('.pdf', '.html');
  }

  private generateHTML(data: ClosureDocumentData, documentNumber: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.4; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
    .header h2 { margin: 5px 0; }
    .header p { margin: 3px 0; }
    .section { margin: 20px 0; }
    .section h4 { background-color: #f2f2f2; padding: 8px; margin: 10px 0 5px 0; border-left: 4px solid #333; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    .total-row { font-weight: bold; background-color: #f9f9f9; }
    .difference-positive { color: green; }
    .difference-negative { color: red; }
    .signature-box { 
      border: 1px solid #000; 
      padding: 15px; 
      margin: 10px 0;
      min-height: 100px;
    }
    .signature-line { 
      border-top: 1px solid #000; 
      margin-top: 60px; 
      padding-top: 5px;
      text-align: center;
    }
    .footer { margin-top: 30px; text-align: center; font-size: 8pt; color: #666; }
    .money { text-align: right; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    ${data.establishment.logoUrl ? `<img src="${data.establishment.logoUrl}" height="60" />` : ''}
    <h2>${data.establishment.name}</h2>
    <p>CNPJ: ${data.establishment.cnpj}</p>
    <p>${data.establishment.address}</p>
    <h3>DOCUMENTO DE FECHAMENTO DE CAIXA</h3>
    <p><strong>Nº ${documentNumber}</strong></p>
  </div>

  <!-- Session Info -->
  <div class="section">
    <h4>DADOS DO FECHAMENTO</h4>
    <table>
      <tr>
        <td><strong>Caixa:</strong></td>
        <td>${data.session.cashRegister}</td>
        <td><strong>Operador:</strong></td>
        <td>${data.session.operator}</td>
      </tr>
      <tr>
        <td><strong>Abertura:</strong></td>
        <td>${format(new Date(data.session.openedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</td>
        <td><strong>Fechamento:</strong></td>
        <td>${format(new Date(data.session.closedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>Duração:</strong></td>
        <td colspan="2">${data.session.duration}</td>
      </tr>
    </table>
  </div>

  <!-- Financial Summary -->
  <div class="section">
    <h4>RESUMO FINANCEIRO</h4>
    <table>
      <tr>
        <td>Valor de Abertura</td>
        <td class="money">R$ ${data.financial.openingAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Vendas em Dinheiro</td>
        <td class="money">R$ ${data.financial.cashSales.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Vendas em Cartão</td>
        <td class="money">R$ ${data.financial.cardSales.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Vendas PIX</td>
        <td class="money">R$ ${data.financial.pixSales.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Sangrias (-)</td>
        <td class="money">R$ ${data.financial.withdrawals.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Suprimentos (+)</td>
        <td class="money">R$ ${data.financial.supplies.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td>TOTAL DE VENDAS</td>
        <td class="money">R$ ${data.financial.salesTotal.toFixed(2)}</td>
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
          <th class="money">Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.counts.map(c => `
        <tr>
          <td>R$ ${c.denomination.toFixed(2)}</td>
          <td>${c.quantity}</td>
          <td class="money">R$ ${c.total.toFixed(2)}</td>
        </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="2">TOTAL CONTADO</td>
          <td class="money">R$ ${data.financial.countedAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Verification -->
  <div class="section">
    <h4>CONFERÊNCIA</h4>
    <table>
      <tr>
        <td>Valor Esperado em Dinheiro</td>
        <td class="money">R$ ${data.financial.expectedCash.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Valor Contado</td>
        <td class="money">R$ ${data.financial.countedAmount.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td>Diferença (Quebra)</td>
        <td class="money ${data.financial.difference >= 0 ? 'difference-positive' : 'difference-negative'}">
          R$ ${data.financial.difference.toFixed(2)} (${data.financial.differencePercent.toFixed(2)}%)
        </td>
      </tr>
    </table>
    
    ${data.justification ? `
    <div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc;">
      <strong>Justificativa:</strong><br>
      ${data.justification}
    </div>
    ` : ''}
  </div>

  <!-- Signatures -->
  <div class="section">
    <h4>ASSINATURAS</h4>
    
    <div class="signature-box">
      <p><strong>Operador de Caixa:</strong> ${data.signatures.operator.name}</p>
      <div class="signature-line">
        Assinatura
      </div>
      <p style="margin-top: 10px;">Data: ___/___/______ Hora: ___:___</p>
    </div>

    <div class="signature-box">
      <p><strong>Responsável pelo Recebimento:</strong></p>
      <div class="signature-line">
        Nome
      </div>
      <div class="signature-line" style="margin-top: 20px;">
        Assinatura
      </div>
      <p style="margin-top: 10px;">Data: ___/___/______ Hora: ___:___</p>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Documento gerado em ${data.generatedAt}</p>
    <p>Hash: ${data.hash || 'Será gerado após criação do PDF'}</p>
  </div>
</body>
</html>
    `;
  }

  private calculateFileHash(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }
}

export const documentGeneratorService = new DocumentGeneratorService();
