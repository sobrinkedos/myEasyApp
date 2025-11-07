# Stock Appraisal & CMV User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Stock Appraisal (Conferência de Estoque)](#stock-appraisal)
4. [CMV Calculation](#cmv-calculation)
5. [Reports and Analytics](#reports-and-analytics)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is Stock Appraisal?

Stock Appraisal (Conferência de Estoque) is the process of physically counting your inventory and comparing it with the theoretical stock calculated by the system. This helps you:

- Identify discrepancies between actual and recorded inventory
- Detect losses, theft, or waste
- Improve inventory accuracy
- Make informed purchasing decisions

### What is CMV?

CMV (Custo de Mercadoria Vendida / Cost of Goods Sold) represents the total cost of products sold during a specific period. Understanding your CMV helps you:

- Calculate actual profit margins
- Identify cost trends
- Optimize pricing strategies
- Control food costs

### Key Concepts

- **Theoretical Stock**: Quantity calculated by the system based on purchases and sales
- **Physical Stock**: Actual quantity counted during appraisal
- **Divergence**: Difference between theoretical and physical stock
- **Accuracy**: Percentage indicating how close physical stock is to theoretical
- **CMV Period**: Time interval for calculating cost of goods sold

---

## Getting Started

### Prerequisites

- Active user account with appropriate permissions
- Manager role (for approving appraisals and closing CMV periods)
- Basic understanding of your inventory items

### Navigation

Access the Stock Appraisal and CMV features from the main menu:

1. Click on **"Estoque"** (Stock) in the sidebar
2. Select **"Conferências"** for Stock Appraisals
3. Select **"CMV"** for CMV management
4. Select **"Relatórios"** for Reports

---

## Stock Appraisal

### Creating a New Appraisal

#### Step 1: Start New Appraisal

1. Navigate to **Conferências** page
2. Click **"Nova Conferência"** button
3. Fill in the form:
   - **Date**: Select the appraisal date
   - **Type**: Choose frequency (Daily, Weekly, or Monthly)
   - **Notes**: Add any relevant observations
4. Click **"Criar Conferência"**

The system will automatically capture the current theoretical stock for all ingredients.

#### Step 2: Count Physical Stock

1. You'll be redirected to the counting page
2. For each ingredient:
   - View the **theoretical quantity** (system calculated)
   - Enter the **physical quantity** (actual count)
   - The system automatically calculates the **divergence**
   - Add a **reason** if there's a significant difference
   - Add **notes** if needed

**Visual Indicators**:
- 🟢 **Green**: Divergence < 5% (acceptable)
- 🟡 **Yellow**: Divergence 5-10% (attention needed)
- 🔴 **Red**: Divergence > 10% (critical)

#### Step 3: Complete the Appraisal

1. Ensure all items have been counted
2. Review the overall **accuracy percentage**
3. Click **"Completar Conferência"**

The appraisal status changes to "Completed" and is ready for manager approval.

#### Step 4: Approve the Appraisal (Manager Only)

1. Navigate to the appraisal detail page
2. Review the summary:
   - Overall accuracy
   - Critical divergences
   - Total difference in monetary value
3. Click **"Aprovar"**
4. Confirm the action

**Important**: Approving an appraisal will adjust the theoretical stock to match the physical count. This action cannot be undone.

### Understanding Accuracy

Accuracy is calculated as:

```
Accuracy = (1 - |Total Divergence Value| / Total Theoretical Value) × 100
```

**Accuracy Levels**:
- **> 95%** (Green): Excellent inventory control
- **90-95%** (Yellow): Good, but room for improvement
- **< 90%** (Red): Requires immediate attention

### Managing Divergences

#### Common Causes of Divergences

1. **Negative Divergence (Shortage)**:
   - Waste or spoilage
   - Theft
   - Incorrect portion sizes
   - Unrecorded consumption
   - Data entry errors

2. **Positive Divergence (Surplus)**:
   - Unrecorded purchases
   - Incorrect recipe calculations
   - Data entry errors
   - Returns from kitchen

#### Best Practices for Handling Divergences

1. **Document Everything**: Always add a reason for divergences > 5%
2. **Investigate Critical Items**: Items with > 10% divergence require immediate investigation
3. **Recount When Necessary**: If a divergence seems unusual, recount the item
4. **Track Patterns**: Look for recurring divergences in specific items
5. **Train Staff**: Ensure proper portioning and recording procedures

### Appraisal Types

#### Daily Appraisal
- **Frequency**: Every day
- **Scope**: High-value or perishable items
- **Purpose**: Quick check for critical items
- **Time**: 15-30 minutes

#### Weekly Appraisal
- **Frequency**: Once per week
- **Scope**: All active ingredients
- **Purpose**: Regular inventory control
- **Time**: 1-2 hours

#### Monthly Appraisal
- **Frequency**: End of month
- **Scope**: Complete inventory (including storage)
- **Purpose**: Financial reporting and CMV calculation
- **Time**: 2-4 hours

---

## CMV Calculation

### Understanding CMV Formula

```
CMV = Opening Stock + Purchases - Closing Stock
```

**Example**:
- Opening Stock: R$ 15,000
- Purchases: R$ 12,000
- Closing Stock: R$ 14,500
- **CMV = R$ 12,500**

**CMV Percentage**:
```
CMV % = (CMV / Revenue) × 100
```

If revenue was R$ 38,500:
- **CMV % = 32.5%**

### Creating a CMV Period

#### Step 1: Start New Period

1. Navigate to **CMV** page
2. Click **"Novo Período"**
3. Fill in the form:
   - **Start Date**: Period beginning
   - **End Date**: Period ending
   - **Type**: Daily, Weekly, or Monthly
4. Click **"Criar Período"**

The system will:
- Capture opening stock from the last approved appraisal
- Set status to "Open"
- Begin tracking purchases automatically

#### Step 2: Monitor the Period

During the open period:
- **Purchases** are automatically recorded from stock transactions
- **Sales** are tracked from orders
- View real-time CMV preview (estimated)

#### Step 3: Close the Period

1. Perform a **closing stock appraisal**
2. Approve the closing appraisal
3. Navigate to the period detail page
4. Click **"Fechar Período"**
5. Select the closing appraisal
6. Review the CMV calculation preview
7. Click **"Confirmar Fechamento"**

The system will:
- Calculate final CMV
- Calculate CMV by product
- Generate comprehensive report
- Lock the period (no further changes)

### Interpreting CMV Results

#### Ideal CMV Percentages by Business Type

- **Fine Dining**: 28-35%
- **Casual Dining**: 30-35%
- **Fast Food**: 25-30%
- **Bar/Pub**: 20-25%
- **Café**: 25-30%

#### CMV Analysis

**If CMV is Too High (> 40%)**:
- Review portion sizes
- Check for waste
- Investigate theft
- Review pricing strategy
- Analyze recipe costs
- Check supplier prices

**If CMV is Too Low (< 20%)**:
- Verify all purchases were recorded
- Check if closing stock is accurate
- Review recipe calculations
- Ensure all sales were recorded

### CMV by Product

The system calculates individual CMV for each product sold:

```
Product CMV = Recipe Cost × Quantity Sold
Product Margin = Revenue - CMV
Margin % = (Margin / Revenue) × 100
```

**Use this to**:
- Identify most profitable products
- Find products with low margins
- Optimize menu pricing
- Decide which products to promote

### Period Types

#### Daily Period
- **Use Case**: High-volume operations
- **Benefit**: Quick identification of issues
- **Requirement**: Daily appraisals

#### Weekly Period
- **Use Case**: Medium-volume operations
- **Benefit**: Balance between detail and effort
- **Requirement**: Weekly appraisals

#### Monthly Period
- **Use Case**: Standard financial reporting
- **Benefit**: Aligns with accounting periods
- **Requirement**: Monthly appraisals

---

## Reports and Analytics

### Available Reports

#### 1. CMV Report

**Access**: CMV → Relatórios → Relatório de CMV

**Includes**:
- Period summary (opening stock, purchases, closing stock, CMV)
- CMV percentage and gross margin
- CMV by category
- Top products by CMV
- Comparison with previous period

**Use Cases**:
- Monthly financial reporting
- Cost analysis
- Management presentations

#### 2. Appraisal Report

**Access**: Conferências → [Select Appraisal] → Exportar PDF

**Includes**:
- Appraisal summary
- Accuracy percentage
- List of all items with divergences
- Critical items (> 10% divergence)
- Distribution chart (green/yellow/red items)

**Use Cases**:
- Audit documentation
- Staff training
- Process improvement

#### 3. Accuracy Trend Report

**Access**: Relatórios → Evolução de Acurácia

**Includes**:
- Accuracy over time (chart)
- Average accuracy
- Improvement/decline trend
- Best and worst appraisals

**Use Cases**:
- Performance monitoring
- Goal setting
- Process evaluation

#### 4. Period Comparison Report

**Access**: CMV → Relatórios → Comparar Períodos

**Includes**:
- Side-by-side period comparison
- CMV variation percentage
- Trend analysis (increasing/decreasing/stable)
- Key metrics comparison

**Use Cases**:
- Seasonal analysis
- Performance tracking
- Budget planning

### Exporting Reports

All reports can be exported as PDF:

1. Navigate to the report
2. Click **"Exportar PDF"**
3. PDF will download automatically

PDFs include:
- Company logo and information
- Report date and period
- All charts and tables
- Summary and recommendations

---

## Best Practices

### Stock Appraisal Best Practices

1. **Schedule Regular Appraisals**
   - Set a consistent schedule (e.g., every Monday morning)
   - Perform appraisals at the same time of day
   - Avoid busy service times

2. **Prepare Before Counting**
   - Organize storage areas
   - Group similar items together
   - Have measuring tools ready (scale, measuring cups)
   - Print ingredient list if needed

3. **Count Accurately**
   - Count twice for high-value items
   - Use proper units (kg, liters, units)
   - Don't estimate - measure precisely
   - Check expiration dates while counting

4. **Document Divergences**
   - Always add a reason for significant differences
   - Take photos if needed
   - Investigate immediately
   - Update procedures if necessary

5. **Review and Approve Promptly**
   - Managers should review within 24 hours
   - Address critical divergences before approving
   - Use insights to improve processes

### CMV Management Best Practices

1. **Maintain Consistent Periods**
   - Use the same period length (e.g., always monthly)
   - Start and end on the same days
   - Don't skip periods

2. **Ensure Accurate Appraisals**
   - Opening and closing appraisals must be accurate
   - Perform thorough counts
   - Approve appraisals before closing periods

3. **Record All Transactions**
   - Enter purchases immediately
   - Record all stock movements
   - Don't forget returns or transfers

4. **Analyze Results**
   - Review CMV percentage monthly
   - Compare with previous periods
   - Investigate significant changes
   - Take corrective action

5. **Use Product-Level Data**
   - Identify high-cost products
   - Optimize recipes for expensive items
   - Adjust pricing based on actual costs
   - Promote high-margin products

### Team Training

1. **Train All Staff**
   - Proper portioning techniques
   - Accurate recording procedures
   - Waste reduction practices
   - System usage

2. **Assign Responsibilities**
   - Designate appraisal team
   - Assign backup personnel
   - Define manager approval process

3. **Regular Reviews**
   - Monthly team meetings
   - Discuss divergences and solutions
   - Share best practices
   - Celebrate improvements

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Low Accuracy (< 90%)

**Possible Causes**:
- Inaccurate counting
- Incorrect recipe calculations
- Unrecorded transactions
- Theft or waste

**Solutions**:
1. Recount critical items
2. Review and update recipes
3. Audit recent transactions
4. Implement better controls
5. Train staff on proper procedures

#### Issue: Cannot Approve Appraisal

**Possible Causes**:
- Not all items counted
- User lacks manager permissions
- Appraisal already approved

**Solutions**:
1. Complete all item counts
2. Contact a manager
3. Check appraisal status

#### Issue: Cannot Close CMV Period

**Possible Causes**:
- No closing appraisal
- Closing appraisal not approved
- Period dates invalid

**Solutions**:
1. Perform closing appraisal
2. Have manager approve appraisal
3. Verify period dates

#### Issue: CMV Percentage Seems Wrong

**Possible Causes**:
- Incorrect opening/closing stock
- Missing purchase records
- Incorrect revenue data
- Recipe costs not updated

**Solutions**:
1. Verify appraisal accuracy
2. Review all purchase transactions
3. Check sales records
4. Update recipe costs

#### Issue: Large Divergence in Specific Item

**Possible Causes**:
- Counting error
- Incorrect unit conversion
- Unrecorded usage
- Theft or waste
- Recipe calculation error

**Solutions**:
1. Recount the item
2. Verify unit of measurement
3. Review recent transactions
4. Check recipe usage
5. Investigate with staff

### Getting Help

If you encounter issues not covered in this guide:

1. **Check the FAQ** (see STOCK_APPRAISAL_CMV_FAQ.md)
2. **Contact Support**:
   - Email: support@restaurantapi.com
   - Phone: [Support Number]
   - Hours: Monday-Friday, 9am-6pm
3. **System Administrator**: Contact your system admin for permission issues

---

## Appendix

### Glossary

- **Appraisal**: Physical inventory count
- **Theoretical Stock**: System-calculated inventory
- **Physical Stock**: Actual counted inventory
- **Divergence**: Difference between theoretical and physical
- **Accuracy**: Percentage of inventory correctness
- **CMV**: Cost of Goods Sold
- **Opening Stock**: Inventory value at period start
- **Closing Stock**: Inventory value at period end
- **Gross Margin**: Revenue minus CMV

### Keyboard Shortcuts

- `Ctrl + N`: New appraisal/period
- `Ctrl + S`: Save current form
- `Ctrl + P`: Print/Export PDF
- `Esc`: Close modal/dialog

### Quick Reference Card

**Stock Appraisal Workflow**:
1. Create → 2. Count → 3. Complete → 4. Approve

**CMV Period Workflow**:
1. Create → 2. Monitor → 3. Close Appraisal → 4. Close Period

**Accuracy Targets**:
- Excellent: > 95%
- Good: 90-95%
- Needs Improvement: < 90%

**CMV Targets** (Casual Dining):
- Ideal: 30-35%
- Acceptable: 35-40%
- High: > 40%

---

**Version**: 1.0  
**Last Updated**: 06/11/2025  
**For**: Restaurant API Core v1.0
