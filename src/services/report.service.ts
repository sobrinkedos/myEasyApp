import { CMVService } from '@/services/cmv.service';
import { AppraisalService } from '@/services/appraisal.service';
import { NotFoundError } from '@/utils/errors';
import prisma from '@/config/database';

export interface CMVReport {
  period: {
    id: string;
    startDate: Date;
    endDate: Date;
    type: string;
    status: string;
  };
  summary: {
    openingStock: number;
    purchases: number;
    closingStock: number;
    cmv: number;
    revenue: number;
    cmvPercentage: number;
    grossMargin: number;
    grossMarginPercentage: number;
  };
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    cmv: number;
    cmvPercentage: number;
    revenue: number;
    margin: number;
    marginPercentage: number;
  }>;
  topProducts: Array<{
    rank: number;
    productId: string;
    productName: string;
    cmv: number;
    cmvPercentage: number;
    revenue: number;
    quantitySold: number;
  }>;
}

export interface AppraisalReport {
  appraisal: {
    id: string;
    date: Date;
    type: string;
    status: string;
    userName: string;
    approverName?: string;
    approvedAt?: Date;
  };
  summary: {
    totalTheoretical: number;
    totalPhysical: number;
    totalDifference: number;
    accuracy: number;
    classification: 'green' | 'yellow' | 'red';
    itemsCount: number;
    countedItems: number;
    uncountedItems: number;
  };
  criticalItems: Array<{
    ingredientId: string;
    ingredientName: string;
    unit: string;
    theoreticalQuantity: number;
    physicalQuantity: number;
    difference: number;
    differencePercentage: number;
    totalDifference: number;
    reason?: string;
  }>;
  divergenceDistribution: {
    surplus: {
      count: number;
      totalValue: number;
    };
    shortage: {
      count: number;
      totalValue: number;
    };
    accurate: {
      count: number;
    };
  };
}

export interface PeriodComparison {
  periods: Array<{
    id: string;
    startDate: Date;
    endDate: Date;
    type: string;
    cmv: number;
    cmvPercentage: number;
    revenue: number;
    grossMargin: number;
    grossMarginPercentage: number;
  }>;
  analysis: {
    cmvVariation: number;
    cmvPercentageVariation: number;
    revenueVariation: number;
    marginVariation: number;
    trend: 'improving' | 'worsening' | 'stable';
  };
  chartData: {
    labels: string[];
    cmvData: number[];
    revenueData: number[];
    marginData: number[];
  };
}

export class ReportService {
  private cmvService: CMVService;
  private appraisalService: AppraisalService;

  constructor() {
    this.cmvService = new CMVService();
    this.appraisalService = new AppraisalService();
  }

  async generateCMVReport(periodId: string): Promise<CMVReport> {
    // Get period data
    const period = await this.cmvService.getById(periodId);

    // Calculate CMV
    const cmvData = await this.cmvService.calculateCMV(periodId);

    // Get product CMV data
    const productCMV = await this.cmvService.calculateProductCMV(periodId);

    // Calculate CMV by category
    const byCategory = await this.calculateCMVByCategory(periodId);

    // Get top products by CMV
    const topProducts = productCMV.slice(0, 10).map((product, index) => ({
      rank: index + 1,
      productId: product.productId,
      productName: product.productName,
      cmv: product.cmv,
      cmvPercentage: cmvData.cmv > 0 ? (product.cmv / cmvData.cmv) * 100 : 0,
      revenue: product.revenue,
      quantitySold: product.quantitySold,
    }));

    return {
      period: {
        id: period.id,
        startDate: period.startDate,
        endDate: period.endDate,
        type: period.type,
        status: period.status,
      },
      summary: {
        openingStock: cmvData.openingStock,
        purchases: cmvData.purchases,
        closingStock: cmvData.closingStock,
        cmv: cmvData.cmv,
        revenue: cmvData.revenue,
        cmvPercentage: cmvData.cmvPercentage,
        grossMargin: cmvData.grossMargin,
        grossMarginPercentage: cmvData.grossMarginPercentage,
      },
      byCategory,
      topProducts,
    };
  }

  private async calculateCMVByCategory(periodId: string): Promise<Array<{
    categoryId: string;
    categoryName: string;
    cmv: number;
    cmvPercentage: number;
    revenue: number;
    margin: number;
    marginPercentage: number;
  }>> {
    // Get period
    const period = await this.cmvService.getById(periodId);

    // Get all order items within the period grouped by category
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: period.startDate,
            lte: period.endDate,
          },
          status: {
            not: 'cancelled',
          },
        },
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            recipe: {
              select: {
                costPerPortion: true,
              },
            },
          },
        },
      },
    });

    // Group by category
    const categoryMap = new Map<string, {
      categoryId: string;
      categoryName: string;
      cmv: number;
      revenue: number;
    }>();

    for (const item of orderItems) {
      const categoryId = item.product.category?.id || 'uncategorized';
      const categoryName = item.product.category?.name || 'Sem Categoria';
      const existing = categoryMap.get(categoryId);

      const revenue = Number(item.subtotal);
      const costPerPortion = item.product.recipe 
        ? Number(item.product.recipe.costPerPortion)
        : 0;
      const cmv = costPerPortion * item.quantity;

      if (existing) {
        existing.cmv += cmv;
        existing.revenue += revenue;
      } else {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName,
          cmv,
          revenue,
        });
      }
    }

    // Calculate total CMV for percentages
    const totalCMV = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.cmv,
      0
    );

    // Calculate margins and percentages
    const results = Array.from(categoryMap.values()).map((category) => {
      const margin = category.revenue - category.cmv;
      const marginPercentage = category.revenue > 0 
        ? (margin / category.revenue) * 100 
        : 0;
      const cmvPercentage = totalCMV > 0 ? (category.cmv / totalCMV) * 100 : 0;

      return {
        ...category,
        margin,
        marginPercentage,
        cmvPercentage,
      };
    });

    // Sort by CMV descending
    results.sort((a, b) => b.cmv - a.cmv);

    return results;
  }

  async generateAppraisalReport(appraisalId: string): Promise<AppraisalReport> {
    // Get appraisal data
    const appraisal = await this.appraisalService.getById(appraisalId);

    // Calculate accuracy
    const { accuracy, classification } = await this.appraisalService.calculateAccuracy(
      appraisalId
    );

    // Count items
    const itemsCount = appraisal.items.length;
    const countedItems = appraisal.items.filter(
      (item) => item.physicalQuantity !== null
    ).length;
    const uncountedItems = itemsCount - countedItems;

    // Get critical items (divergence > 10%)
    const criticalItems = appraisal.items
      .filter((item) => {
        if (item.differencePercentage === null) return false;
        return Math.abs(Number(item.differencePercentage)) > 10;
      })
      .map((item) => ({
        ingredientId: item.ingredientId,
        ingredientName: item.ingredient.name,
        unit: item.ingredient.unit,
        theoreticalQuantity: Number(item.theoreticalQuantity),
        physicalQuantity: Number(item.physicalQuantity || 0),
        difference: Number(item.difference || 0),
        differencePercentage: Number(item.differencePercentage || 0),
        totalDifference: Number(item.totalDifference || 0),
        reason: item.reason || undefined,
      }))
      .sort((a, b) => Math.abs(b.differencePercentage) - Math.abs(a.differencePercentage));

    // Calculate divergence distribution
    const divergenceDistribution = this.calculateDivergenceDistribution(appraisal.items);

    return {
      appraisal: {
        id: appraisal.id,
        date: appraisal.date,
        type: appraisal.type,
        status: appraisal.status,
        userName: appraisal.user.name,
        approverName: appraisal.approver?.name,
        approvedAt: appraisal.approvedAt || undefined,
      },
      summary: {
        totalTheoretical: Number(appraisal.totalTheoretical || 0),
        totalPhysical: Number(appraisal.totalPhysical || 0),
        totalDifference: Number(appraisal.totalDifference || 0),
        accuracy,
        classification,
        itemsCount,
        countedItems,
        uncountedItems,
      },
      criticalItems,
      divergenceDistribution,
    };
  }

  private calculateDivergenceDistribution(items: any[]): {
    surplus: { count: number; totalValue: number };
    shortage: { count: number; totalValue: number };
    accurate: { count: number };
  } {
    const distribution = {
      surplus: { count: 0, totalValue: 0 },
      shortage: { count: 0, totalValue: 0 },
      accurate: { count: 0 },
    };

    for (const item of items) {
      if (item.difference === null || item.difference === undefined) {
        continue;
      }

      const difference = Number(item.difference);
      const totalDifference = Number(item.totalDifference || 0);

      if (difference > 0) {
        distribution.surplus.count++;
        distribution.surplus.totalValue += totalDifference;
      } else if (difference < 0) {
        distribution.shortage.count++;
        distribution.shortage.totalValue += Math.abs(totalDifference);
      } else {
        distribution.accurate.count++;
      }
    }

    return distribution;
  }

  async comparePeriods(periodIds: string[]): Promise<PeriodComparison> {
    if (periodIds.length < 2) {
      throw new Error('É necessário fornecer pelo menos 2 períodos para comparação');
    }

    // Get all periods
    const periods = await Promise.all(
      periodIds.map((id) => this.cmvService.getById(id))
    );

    // Sort periods by start date
    periods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Calculate CMV for each period
    const periodsData = await Promise.all(
      periods.map(async (period) => {
        const cmvData = await this.cmvService.calculateCMV(period.id);
        return {
          id: period.id,
          startDate: period.startDate,
          endDate: period.endDate,
          type: period.type,
          cmv: cmvData.cmv,
          cmvPercentage: cmvData.cmvPercentage,
          revenue: cmvData.revenue,
          grossMargin: cmvData.grossMargin,
          grossMarginPercentage: cmvData.grossMarginPercentage,
        };
      })
    );

    // Calculate variations (comparing last period with first period)
    const firstPeriod = periodsData[0];
    const lastPeriod = periodsData[periodsData.length - 1];

    const cmvVariation = lastPeriod.cmv - firstPeriod.cmv;
    const cmvPercentageVariation = lastPeriod.cmvPercentage - firstPeriod.cmvPercentage;
    const revenueVariation = lastPeriod.revenue - firstPeriod.revenue;
    const marginVariation = lastPeriod.grossMargin - firstPeriod.grossMargin;

    // Determine trend based on CMV percentage
    let trend: 'improving' | 'worsening' | 'stable';
    if (cmvPercentageVariation < -2) {
      trend = 'improving'; // CMV percentage decreased (better)
    } else if (cmvPercentageVariation > 2) {
      trend = 'worsening'; // CMV percentage increased (worse)
    } else {
      trend = 'stable';
    }

    // Prepare chart data
    const chartData = {
      labels: periodsData.map((p) => 
        `${p.startDate.toLocaleDateString('pt-BR')} - ${p.endDate.toLocaleDateString('pt-BR')}`
      ),
      cmvData: periodsData.map((p) => p.cmvPercentage),
      revenueData: periodsData.map((p) => p.revenue),
      marginData: periodsData.map((p) => p.grossMarginPercentage),
    };

    return {
      periods: periodsData,
      analysis: {
        cmvVariation,
        cmvPercentageVariation,
        revenueVariation,
        marginVariation,
        trend,
      },
      chartData,
    };
  }

  async exportCMVReportPDF(periodId: string): Promise<string> {
    // Generate CMV report
    const report = await this.generateCMVReport(periodId);

    // Generate HTML content for PDF
    const html = this.generateCMVReportHTML(report);

    return html;
  }

  async exportAppraisalPDF(appraisalId: string): Promise<string> {
    // Generate appraisal report
    const report = await this.generateAppraisalReport(appraisalId);

    // Generate HTML content for PDF
    const html = this.generateAppraisalReportHTML(report);

    return html;
  }

  private generateCMVReportHTML(report: CMVReport): string {
    const { period, summary, byCategory, topProducts } = report;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de CMV - ${period.startDate.toLocaleDateString('pt-BR')} a ${period.endDate.toLocaleDateString('pt-BR')}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 20px 0;
    }
    .info-item {
      padding: 10px;
      background: #ecf0f1;
      border-radius: 5px;
    }
    .info-label {
      font-weight: bold;
      color: #7f8c8d;
      font-size: 12px;
    }
    .info-value {
      font-size: 18px;
      color: #2c3e50;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #3498db;
      color: white;
      padding: 12px;
      text-align: left;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ecf0f1;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .positive {
      color: #27ae60;
    }
    .negative {
      color: #e74c3c;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #bdc3c7;
      text-align: center;
      color: #7f8c8d;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Relatório de CMV</h1>
  
  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Período</div>
      <div class="info-value">${period.startDate.toLocaleDateString('pt-BR')} a ${period.endDate.toLocaleDateString('pt-BR')}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Tipo</div>
      <div class="info-value">${period.type === 'daily' ? 'Diário' : period.type === 'weekly' ? 'Semanal' : 'Mensal'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Status</div>
      <div class="info-value">${period.status === 'open' ? 'Aberto' : 'Fechado'}</div>
    </div>
  </div>

  <h2>Resumo Financeiro</h2>
  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Estoque Inicial</div>
      <div class="info-value">R$ ${summary.openingStock.toFixed(2)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Compras</div>
      <div class="info-value">R$ ${summary.purchases.toFixed(2)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Estoque Final</div>
      <div class="info-value">R$ ${summary.closingStock.toFixed(2)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">CMV</div>
      <div class="info-value">R$ ${summary.cmv.toFixed(2)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Receita</div>
      <div class="info-value">R$ ${summary.revenue.toFixed(2)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">CMV %</div>
      <div class="info-value ${summary.cmvPercentage > 40 ? 'negative' : 'positive'}">${summary.cmvPercentage.toFixed(2)}%</div>
    </div>
    <div class="info-item">
      <div class="info-label">Margem Bruta</div>
      <div class="info-value">R$ ${summary.grossMargin.toFixed(2)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Margem Bruta %</div>
      <div class="info-value class="${summary.grossMarginPercentage > 60 ? 'positive' : 'negative'}">${summary.grossMarginPercentage.toFixed(2)}%</div>
    </div>
  </div>

  <h2>CMV por Categoria</h2>
  <table>
    <thead>
      <tr>
        <th>Categoria</th>
        <th>CMV</th>
        <th>CMV %</th>
        <th>Receita</th>
        <th>Margem</th>
        <th>Margem %</th>
      </tr>
    </thead>
    <tbody>
      ${byCategory.map(cat => `
        <tr>
          <td>${cat.categoryName}</td>
          <td>R$ ${cat.cmv.toFixed(2)}</td>
          <td>${cat.cmvPercentage.toFixed(2)}%</td>
          <td>R$ ${cat.revenue.toFixed(2)}</td>
          <td>R$ ${cat.margin.toFixed(2)}</td>
          <td>${cat.marginPercentage.toFixed(2)}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Top 10 Produtos por CMV</h2>
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Produto</th>
        <th>Qtd Vendida</th>
        <th>CMV</th>
        <th>CMV %</th>
        <th>Receita</th>
      </tr>
    </thead>
    <tbody>
      ${topProducts.map(product => `
        <tr>
          <td>${product.rank}</td>
          <td>${product.productName}</td>
          <td>${product.quantitySold}</td>
          <td>R$ ${product.cmv.toFixed(2)}</td>
          <td>${product.cmvPercentage.toFixed(2)}%</td>
          <td>R$ ${product.revenue.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
  </div>
</body>
</html>
    `;
  }

  private generateAppraisalReportHTML(report: AppraisalReport): string {
    const { appraisal, summary, criticalItems, divergenceDistribution } = report;

    const classificationColor = 
      summary.classification === 'green' ? '#27ae60' :
      summary.classification === 'yellow' ? '#f39c12' : '#e74c3c';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Conferência de Estoque - ${appraisal.date.toLocaleDateString('pt-BR')}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 20px 0;
    }
    .info-item {
      padding: 10px;
      background: #ecf0f1;
      border-radius: 5px;
    }
    .info-label {
      font-weight: bold;
      color: #7f8c8d;
      font-size: 12px;
    }
    .info-value {
      font-size: 18px;
      color: #2c3e50;
      margin-top: 5px;
    }
    .accuracy-badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 5px;
      color: white;
      font-size: 24px;
      font-weight: bold;
      background: ${classificationColor};
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #3498db;
      color: white;
      padding: 12px;
      text-align: left;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ecf0f1;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .positive {
      color: #27ae60;
    }
    .negative {
      color: #e74c3c;
    }
    .distribution-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .distribution-card {
      padding: 15px;
      border-radius: 5px;
      text-align: center;
    }
    .distribution-card.surplus {
      background: #d5f4e6;
      border: 2px solid #27ae60;
    }
    .distribution-card.shortage {
      background: #fadbd8;
      border: 2px solid #e74c3c;
    }
    .distribution-card.accurate {
      background: #d6eaf8;
      border: 2px solid #3498db;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #bdc3c7;
      text-align: center;
      color: #7f8c8d;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Relatório de Conferência de Estoque</h1>
  
  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Data</div>
      <div class="info-value">${appraisal.date.toLocaleDateString('pt-BR')}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Tipo</div>
      <div class="info-value">${appraisal.type === 'daily' ? 'Diária' : appraisal.type === 'weekly' ? 'Semanal' : 'Mensal'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Status</div>
      <div class="info-value">${appraisal.status === 'pending' ? 'Pendente' : appraisal.status === 'completed' ? 'Completa' : 'Aprovada'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Responsável</div>
      <div class="info-value">${appraisal.userName}</div>
    </div>
    ${appraisal.approverName ? `
    <div class="info-item">
      <div class="info-label">Aprovado por</div>
      <div class="info-value">${appraisal.approverName}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Data de Aprovação</div>
      <div class="info-value">${appraisal.approvedAt ? new Date(appraisal.approvedAt).toLocaleDateString('pt-BR') : '-'}</div>
    </div>
    ` : ''}
  </div>

  <h2>Acurácia</h2>
  <div style="text-align: center; margin: 30px 0;">
    <div class="accuracy-badge">${summary.accuracy.toFixed(2)}%</div>
    <p style="margin-top: 10px; color: #7f8c8d;">
      Classificação: ${summary.classification === 'green' ? 'Excelente' : summary.classification === 'yellow' ? 'Boa' : 'Requer Atenção'}
    </p>
  </div>

  <h2>Resumo</h2>
  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Total Teórico</div>
      <div class="info-value">R$ ${summary.totalTheoretical.toFixed(2)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Total Físico</div>
      <div class="info-value">R$ ${summary.totalPhysical.toFixed(2)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Diferença Total</div>
      <div class="info-value class="${summary.totalDifference >= 0 ? 'positive' : 'negative'}">R$ ${summary.totalDifference.toFixed(2)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Itens Contados</div>
      <div class="info-value">${summary.countedItems} / ${summary.itemsCount}</div>
    </div>
  </div>

  <h2>Distribuição de Divergências</h2>
  <div class="distribution-grid">
    <div class="distribution-card surplus">
      <h3>Sobras</h3>
      <p style="font-size: 24px; margin: 10px 0;">${divergenceDistribution.surplus.count}</p>
      <p style="color: #27ae60; font-weight: bold;">R$ ${divergenceDistribution.surplus.totalValue.toFixed(2)}</p>
    </div>
    <div class="distribution-card shortage">
      <h3>Faltas</h3>
      <p style="font-size: 24px; margin: 10px 0;">${divergenceDistribution.shortage.count}</p>
      <p style="color: #e74c3c; font-weight: bold;">R$ ${divergenceDistribution.shortage.totalValue.toFixed(2)}</p>
    </div>
    <div class="distribution-card accurate">
      <h3>Precisos</h3>
      <p style="font-size: 24px; margin: 10px 0;">${divergenceDistribution.accurate.count}</p>
      <p style="color: #3498db; font-weight: bold;">Sem divergência</p>
    </div>
  </div>

  ${criticalItems.length > 0 ? `
  <h2>Itens Críticos (Divergência > 10%)</h2>
  <table>
    <thead>
      <tr>
        <th>Ingrediente</th>
        <th>Unidade</th>
        <th>Teórico</th>
        <th>Físico</th>
        <th>Diferença</th>
        <th>Diferença %</th>
        <th>Valor</th>
        <th>Motivo</th>
      </tr>
    </thead>
    <tbody>
      ${criticalItems.map(item => `
        <tr>
          <td>${item.ingredientName}</td>
          <td>${item.unit}</td>
          <td>${item.theoreticalQuantity.toFixed(2)}</td>
          <td>${item.physicalQuantity.toFixed(2)}</td>
          <td class="${item.difference >= 0 ? 'positive' : 'negative'}">${item.difference.toFixed(2)}</td>
          <td class="${item.differencePercentage >= 0 ? 'positive' : 'negative'}">${item.differencePercentage.toFixed(2)}%</td>
          <td class="${item.totalDifference >= 0 ? 'positive' : 'negative'}">R$ ${item.totalDifference.toFixed(2)}</td>
          <td>${item.reason || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>Nenhum item crítico identificado.</p>'}

  <div class="footer">
    <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
  </div>
</body>
</html>
    `;
  }
}
