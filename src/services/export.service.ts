import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { closureDocumentRepository } from '@/repositories/closure-document.repository';
import { logger } from '@/utils/logger';

export class ExportService {
  async exportClosures(
    format: 'excel' | 'csv',
    startDate: Date,
    endDate: Date
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    try {
      logger.info(`Exporting closures from ${startDate} to ${endDate} in ${format} format`);

      // Fetch all closures in the date range
      const documents = await closureDocumentRepository.findMany({
        startDate,
        endDate,
      });

      // Transform data for export
      const exportData = documents.map((doc: any) => {
        const metadata = doc.metadata as any;
        return {
          'Número do Documento': doc.documentNumber,
          'Data/Hora': format(new Date(doc.generatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          'Operador': metadata.session.operator,
          'Caixa': metadata.session.cashRegister,
          'Abertura': format(new Date(metadata.session.openedAt), 'dd/MM/yyyy HH:mm', {
            locale: ptBR,
          }),
          'Fechamento': format(new Date(metadata.session.closedAt), 'dd/MM/yyyy HH:mm', {
            locale: ptBR,
          }),
          'Duração': metadata.session.duration,
          'Valor Abertura': metadata.financial.openingAmount,
          'Vendas Dinheiro': metadata.financial.cashSales,
          'Vendas Cartão': metadata.financial.cardSales,
          'Vendas PIX': metadata.financial.pixSales,
          'Sangrias': metadata.financial.withdrawals,
          'Suprimentos': metadata.financial.supplies,
          'Total Vendas': metadata.financial.salesTotal,
          'Esperado em Caixa': metadata.financial.expectedCash,
          'Valor Contado': metadata.financial.countedAmount,
          'Diferença': metadata.financial.difference,
          'Diferença %': metadata.financial.differencePercent,
          'Status': this.getStatus(metadata.financial.differencePercent),
        };
      });

      if (format === 'csv') {
        return this.generateCSV(exportData, startDate, endDate);
      } else {
        return this.generateExcel(exportData, startDate, endDate);
      }
    } catch (error) {
      logger.error('Error exporting closures:', error);
      throw error;
    }
  }

  private generateCSV(
    data: any[],
    startDate: Date,
    endDate: Date
  ): { buffer: Buffer; filename: string; mimeType: string } {
    if (data.length === 0) {
      const buffer = Buffer.from('Nenhum fechamento encontrado no período especificado');
      return {
        buffer,
        filename: this.generateFilename('csv', startDate, endDate),
        mimeType: 'text/csv',
      };
    }

    // Generate CSV header
    const headers = Object.keys(data[0]);
    const csvHeader = headers.join(';') + '\n';

    // Generate CSV rows
    const csvRows = data
      .map((row) => {
        return headers
          .map((header) => {
            const value = row[header];
            // Escape values that contain semicolons or quotes
            if (typeof value === 'string' && (value.includes(';') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(';');
      })
      .join('\n');

    const csv = csvHeader + csvRows;
    const buffer = Buffer.from('\uFEFF' + csv, 'utf-8'); // Add BOM for Excel compatibility

    return {
      buffer,
      filename: this.generateFilename('csv', startDate, endDate),
      mimeType: 'text/csv',
    };
  }

  private async generateExcel(
    data: any[],
    startDate: Date,
    endDate: Date
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    // TODO: Implement Excel generation with ExcelJS
    // For now, return CSV as fallback
    logger.warn('Excel export not yet implemented, falling back to CSV');
    return this.generateCSV(data, startDate, endDate);

    /* Implementation with ExcelJS:
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fechamentos');

    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      worksheet.addRow(values);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buffer),
      filename: this.generateFilename('xlsx', startDate, endDate),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    */
  }

  private generateFilename(extension: string, startDate: Date, endDate: Date): string {
    const start = format(startDate, 'yyyyMMdd');
    const end = format(endDate, 'yyyyMMdd');
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    return `fechamentos-${start}-${end}-${timestamp}.${extension}`;
  }

  private getStatus(differencePercent: number): string {
    const absDiff = Math.abs(differencePercent);
    if (absDiff > 1) return 'Alerta';
    if (absDiff > 0.5) return 'Atenção';
    return 'Normal';
  }
}

export const exportService = new ExportService();
