export interface PriceCalculation {
  cost: number;
  targetMargin: number;
  suggestedPrice: number;
  currentPrice?: number;
  currentMargin?: number;
  markup?: number;
  difference?: number;
  needsAdjustment?: boolean;
}

export interface ProfitabilityAnalysis {
  productId: string;
  productName: string;
  cost: number;
  price: number;
  margin: number;
  marginPercentage: number;
  markup: number;
  targetMargin: number;
  suggestedPrice: number;
  status: 'excellent' | 'good' | 'acceptable' | 'low' | 'negative';
  recommendation: string;
}

export class PricingService {
  /**
   * Calcula o preço sugerido baseado no custo e margem desejada
   * Fórmula: Preço = Custo / (1 - Margem)
   * Exemplo: Custo R$ 10, Margem 65% = R$ 10 / 0.35 = R$ 28.57
   */
  calculateSuggestedPrice(cost: number, targetMarginPercentage: number): number {
    if (cost <= 0) {
      throw new Error('Custo deve ser maior que zero');
    }

    if (targetMarginPercentage < 0 || targetMarginPercentage >= 100) {
      throw new Error('Margem deve estar entre 0 e 100%');
    }

    const marginDecimal = targetMarginPercentage / 100;
    const suggestedPrice = cost / (1 - marginDecimal);

    return Math.round(suggestedPrice * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calcula a margem de contribuição
   * Fórmula: Margem % = ((Preço - Custo) / Preço) × 100
   */
  calculateMargin(cost: number, price: number): number {
    if (price <= 0) {
      return 0;
    }

    const margin = ((price - cost) / price) * 100;
    return Math.round(margin * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calcula o markup
   * Fórmula: Markup = Preço / Custo
   */
  calculateMarkup(cost: number, price: number): number {
    if (cost <= 0) {
      return 0;
    }

    const markup = price / cost;
    return Math.round(markup * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calcula o custo baseado no preço e margem
   * Fórmula: Custo = Preço × (1 - Margem)
   */
  calculateCostFromPrice(price: number, marginPercentage: number): number {
    const marginDecimal = marginPercentage / 100;
    return price * (1 - marginDecimal);
  }

  /**
   * Análise completa de precificação
   */
  analyzePricing(
    cost: number,
    currentPrice: number,
    targetMarginPercentage: number
  ): PriceCalculation {
    const suggestedPrice = this.calculateSuggestedPrice(cost, targetMarginPercentage);
    const currentMargin = this.calculateMargin(cost, currentPrice);
    const markup = this.calculateMarkup(cost, currentPrice);
    const difference = currentPrice - suggestedPrice;
    const needsAdjustment = Math.abs(difference) > suggestedPrice * 0.05; // 5% tolerance

    return {
      cost,
      targetMargin: targetMarginPercentage,
      suggestedPrice,
      currentPrice,
      currentMargin,
      markup,
      difference,
      needsAdjustment,
    };
  }

  /**
   * Análise de rentabilidade do produto
   */
  analyzeProfitability(
    productId: string,
    productName: string,
    cost: number,
    price: number,
    targetMarginPercentage: number
  ): ProfitabilityAnalysis {
    const margin = price - cost;
    const marginPercentage = this.calculateMargin(cost, price);
    const markup = this.calculateMarkup(cost, price);
    const suggestedPrice = this.calculateSuggestedPrice(cost, targetMarginPercentage);

    let status: ProfitabilityAnalysis['status'];
    let recommendation: string;

    if (marginPercentage < 0) {
      status = 'negative';
      recommendation = `URGENTE: Produto com prejuízo! Ajustar preço para pelo menos R$ ${suggestedPrice.toFixed(2)}`;
    } else if (marginPercentage < targetMarginPercentage * 0.7) {
      status = 'low';
      recommendation = `Margem abaixo do ideal. Sugerimos aumentar o preço para R$ ${suggestedPrice.toFixed(2)}`;
    } else if (marginPercentage < targetMarginPercentage * 0.9) {
      status = 'acceptable';
      recommendation = `Margem aceitável, mas pode melhorar. Considere ajustar para R$ ${suggestedPrice.toFixed(2)}`;
    } else if (marginPercentage < targetMarginPercentage * 1.1) {
      status = 'good';
      recommendation = 'Margem dentro do esperado. Manter monitoramento.';
    } else {
      status = 'excellent';
      recommendation = 'Excelente margem! Produto muito rentável.';
    }

    return {
      productId,
      productName,
      cost,
      price,
      margin,
      marginPercentage,
      markup,
      targetMargin: targetMarginPercentage,
      suggestedPrice,
      status,
      recommendation,
    };
  }

  /**
   * Simula diferentes cenários de precificação
   */
  simulatePricing(
    cost: number,
    margins: number[]
  ): Array<{ margin: number; price: number; profit: number }> {
    return margins.map((margin) => {
      const price = this.calculateSuggestedPrice(cost, margin);
      const profit = price - cost;

      return {
        margin,
        price: Math.round(price * 100) / 100,
        profit: Math.round(profit * 100) / 100,
      };
    });
  }

  /**
   * Calcula o preço mínimo viável (break-even)
   */
  calculateBreakEvenPrice(cost: number, fixedCosts: number = 0): number {
    return cost + fixedCosts;
  }

  /**
   * Calcula o impacto de mudança de preço nas vendas
   * Elasticidade simplificada: -1.5 (cada 1% de aumento reduz 1.5% nas vendas)
   */
  calculatePriceImpact(
    currentPrice: number,
    newPrice: number,
    currentVolume: number,
    elasticity: number = -1.5
  ): {
    priceChange: number;
    priceChangePercentage: number;
    volumeChange: number;
    volumeChangePercentage: number;
    newVolume: number;
    revenueChange: number;
  } {
    const priceChange = newPrice - currentPrice;
    const priceChangePercentage = (priceChange / currentPrice) * 100;
    const volumeChangePercentage = priceChangePercentage * elasticity;
    const volumeChange = (currentVolume * volumeChangePercentage) / 100;
    const newVolume = currentVolume + volumeChange;

    const currentRevenue = currentPrice * currentVolume;
    const newRevenue = newPrice * newVolume;
    const revenueChange = newRevenue - currentRevenue;

    return {
      priceChange: Math.round(priceChange * 100) / 100,
      priceChangePercentage: Math.round(priceChangePercentage * 100) / 100,
      volumeChange: Math.round(volumeChange),
      volumeChangePercentage: Math.round(volumeChangePercentage * 100) / 100,
      newVolume: Math.round(newVolume),
      revenueChange: Math.round(revenueChange * 100) / 100,
    };
  }

  /**
   * Valida se o preço está dentro de limites aceitáveis
   */
  validatePrice(cost: number, price: number, minMargin: number = 20): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (price <= cost) {
      errors.push('Preço deve ser maior que o custo');
    }

    const margin = this.calculateMargin(cost, price);
    if (margin < minMargin) {
      errors.push(`Margem mínima de ${minMargin}% não atingida (atual: ${margin.toFixed(1)}%)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
