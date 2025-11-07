# Stock Appraisal & CMV Workflows

## Overview

This document provides detailed workflow diagrams and step-by-step processes for the Stock Appraisal and CMV modules.

---

## Table of Contents

1. [Stock Appraisal Workflows](#stock-appraisal-workflows)
2. [CMV Period Workflows](#cmv-period-workflows)
3. [Integration Workflows](#integration-workflows)
4. [Error Handling Workflows](#error-handling-workflows)

---

## Stock Appraisal Workflows

### Workflow 1: Complete Stock Appraisal Process

```
┌─────────────────────────────────────────────────────────────┐
│                  STOCK APPRAISAL WORKFLOW                    │
└─────────────────────────────────────────────────────────────┘

[START]
   │
   ├─→ User navigates to Appraisals page
   │
   ├─→ User clicks "Nova Conferência"
   │
   ├─→ User fills form:
   │   ├─ Date
   │   ├─ Type (daily/weekly/monthly)
   │   └─ Notes
   │
   ├─→ User submits form
   │
   ├─→ System validates input
   │   ├─ Valid? → Continue
   │   └─ Invalid? → Show errors, return to form
   │
   ├─→ System creates appraisal (status: pending)
   │
   ├─→ System captures theoretical stock for all ingredients
   │
   ├─→ System redirects to counting page
   │
   ├─→ FOR EACH INGREDIENT:
   │   │
   │   ├─→ System displays theoretical quantity
   │   │
   │   ├─→ User enters physical quantity
   │   │
   │   ├─→ System calculates divergence:
   │   │   ├─ Difference = Physical - Theoretical
   │   │   ├─ Percentage = (Difference / Theoretical) × 100
   │   │   └─ Value = Difference × Unit Cost
   │   │
   │   ├─→ System shows visual indicator:
   │   │   ├─ Green: < 5%
   │   │   ├─ Yellow: 5-10%
   │   │   └─ Red: > 10%
   │   │
   │   ├─→ IF divergence > 5%:
   │   │   └─→ User adds reason
   │   │
   │   └─→ User adds notes (optional)
   │
   ├─→ User clicks "Completar Conferência"
   │
   ├─→ System validates:
   │   ├─ All items counted? → Continue
   │   └─ Missing items? → Show error, return to counting
   │
   ├─→ System calculates overall accuracy:
   │   └─ Accuracy = (1 - |Total Divergence| / Total Theoretical) × 100
   │
   ├─→ System updates status to "completed"
   │
   ├─→ System redirects to review page
   │
   ├─→ Manager reviews:
   │   ├─ Overall accuracy
   │   ├─ Critical divergences (> 10%)
   │   ├─ Total difference in R$
   │   └─ Item-by-item details
   │
   ├─→ Manager clicks "Aprovar"
   │
   ├─→ System shows confirmation dialog
   │
   ├─→ Manager confirms approval
   │
   ├─→ System validates:
   │   ├─ User is manager? → Continue
   │   ├─ Appraisal completed? → Continue
   │   └─ Validation fails? → Show error
   │
   ├─→ System adjusts theoretical stock to physical:
   │   └─ FOR EACH ITEM:
   │       └─ Update ingredient.currentStock = physicalQuantity
   │
   ├─→ System records:
   │   ├─ approvedBy = current user
   │   ├─ approvedAt = current timestamp
   │   └─ status = "approved"
   │
   ├─→ System creates audit log entry
   │
   ├─→ System generates alerts if:
   │   ├─ Accuracy < 90%
   │   └─ Any item divergence > 20%
   │
   └─→ [END] - Appraisal complete and approved
```

### Workflow 2: Quick Daily Appraisal

```
┌─────────────────────────────────────────────────────────────┐
│              QUICK DAILY APPRAISAL WORKFLOW                  │
└─────────────────────────────────────────────────────────────┘

[START]
   │
   ├─→ User creates daily appraisal
   │
   ├─→ System shows only high-value items (configurable)
   │
   ├─→ User counts critical items only:
   │   ├─ Meat products
   │   ├─ Seafood
   │   ├─ Premium ingredients
   │   └─ High-cost items
   │
   ├─→ User completes and submits
   │
   ├─→ IF accuracy > 95%:
   │   └─→ Auto-approve (if configured)
   │
   ├─→ ELSE:
   │   └─→ Require manager approval
   │
   └─→ [END]
```

### Workflow 3: Handling Critical Divergences

```
┌─────────────────────────────────────────────────────────────┐
│           CRITICAL DIVERGENCE HANDLING WORKFLOW              │
└─────────────────────────────────────────────────────────────┘

[TRIGGER: Divergence > 10% detected]
   │
   ├─→ System highlights item in red
   │
   ├─→ System requires reason (mandatory)
   │
   ├─→ User enters reason
   │
   ├─→ System suggests:
   │   ├─ "Recount this item"
   │   └─ "Add to investigation list"
   │
   ├─→ User chooses action:
   │   │
   │   ├─→ RECOUNT:
   │   │   ├─→ User recounts item
   │   │   ├─→ User updates physical quantity
   │   │   └─→ System recalculates divergence
   │   │
   │   └─→ INVESTIGATE:
   │       ├─→ System adds to investigation queue
   │       ├─→ System notifies manager
   │       └─→ Manager reviews and takes action
   │
   ├─→ IF divergence still > 20%:
   │   └─→ Require manager approval before completing
   │
   └─→ [END]
```

---

## CMV Period Workflows

### Workflow 4: Complete CMV Period Cycle

```
┌─────────────────────────────────────────────────────────────┐
│                  CMV PERIOD WORKFLOW                         │
└─────────────────────────────────────────────────────────────┘

[START]
   │
   ├─→ Manager navigates to CMV page
   │
   ├─→ Manager clicks "Novo Período"
   │
   ├─→ Manager fills form:
   │   ├─ Start Date
   │   ├─ End Date
   │   └─ Type (daily/weekly/monthly)
   │
   ├─→ Manager submits form
   │
   ├─→ System validates:
   │   ├─ No overlapping periods? → Continue
   │   ├─ No other open period? → Continue
   │   ├─ Valid date range? → Continue
   │   └─ Validation fails? → Show error
   │
   ├─→ System creates period (status: open)
   │
   ├─→ System captures opening stock:
   │   ├─ Find last approved appraisal
   │   ├─ Calculate total stock value
   │   └─ Set as openingStock
   │
   ├─→ System initializes:
   │   ├─ purchases = 0
   │   ├─ closingStock = 0
   │   └─ cmv = 0
   │
   ├─→ [PERIOD IS OPEN - Monitoring Phase]
   │   │
   │   ├─→ AUTOMATIC PROCESSES:
   │   │   │
   │   │   ├─→ ON STOCK PURCHASE:
   │   │   │   ├─→ System detects new stock transaction (type: purchase)
   │   │   │   ├─→ System adds to period.purchases
   │   │   │   └─→ System updates purchase history
   │   │   │
   │   │   └─→ ON PRODUCT SALE:
   │   │       ├─→ System detects new order
   │   │       ├─→ System records product sales
   │   │       └─→ System accumulates revenue
   │   │
   │   └─→ MANUAL MONITORING:
   │       ├─→ Manager views period dashboard
   │       ├─→ System shows:
   │       │   ├─ Current purchases total
   │       │   ├─ Current revenue
   │       │   ├─ Estimated CMV (preview)
   │       │   └─ Days remaining in period
   │       │
   │       └─→ Manager can view detailed transactions
   │
   ├─→ [END OF PERIOD - Closing Phase]
   │
   ├─→ Manager initiates closing process
   │
   ├─→ System checks:
   │   ├─ Period end date reached? → Continue
   │   └─ Not yet? → Show warning, allow override
   │
   ├─→ Manager performs closing stock appraisal:
   │   ├─→ Create new appraisal
   │   ├─→ Count all items
   │   ├─→ Complete appraisal
   │   └─→ Approve appraisal
   │
   ├─→ Manager returns to period page
   │
   ├─→ Manager clicks "Fechar Período"
   │
   ├─→ System validates:
   │   ├─ Closing appraisal exists? → Continue
   │   ├─ Closing appraisal approved? → Continue
   │   └─ Validation fails? → Show error
   │
   ├─→ System calculates closing stock:
   │   └─ closingStock = total value from closing appraisal
   │
   ├─→ System calculates CMV:
   │   └─ CMV = openingStock + purchases - closingStock
   │
   ├─→ System calculates CMV percentage:
   │   └─ CMV% = (CMV / revenue) × 100
   │
   ├─→ System calculates gross margin:
   │   ├─ Gross Margin = revenue - CMV
   │   └─ Gross Margin% = (Gross Margin / revenue) × 100
   │
   ├─→ System calculates CMV by product:
   │   └─ FOR EACH PRODUCT SOLD:
   │       ├─ Get recipe cost
   │       ├─ Calculate: Product CMV = recipe cost × quantity sold
   │       ├─ Calculate: Product Revenue = price × quantity sold
   │       ├─ Calculate: Product Margin = revenue - CMV
   │       └─ Calculate: Margin% = (margin / revenue) × 100
   │
   ├─→ System shows preview:
   │   ├─ CMV calculation breakdown
   │   ├─ CMV percentage
   │   ├─ Comparison with previous period
   │   └─ Top products by CMV
   │
   ├─→ Manager reviews and confirms
   │
   ├─→ System updates period:
   │   ├─ status = "closed"
   │   ├─ closedAt = current timestamp
   │   └─ Saves all calculated values
   │
   ├─→ System creates audit log entry
   │
   ├─→ System generates alerts if:
   │   ├─ CMV% > 40%
   │   └─ CMV% increased > 5% from previous period
   │
   ├─→ System generates comprehensive report
   │
   └─→ [END] - Period closed and CMV calculated
```

### Workflow 5: CMV Analysis and Action

```
┌─────────────────────────────────────────────────────────────┐
│              CMV ANALYSIS & ACTION WORKFLOW                  │
└─────────────────────────────────────────────────────────────┘

[START: Period closed]
   │
   ├─→ Manager views CMV report
   │
   ├─→ System displays:
   │   ├─ Overall CMV%
   │   ├─ Trend (vs previous periods)
   │   ├─ CMV by category
   │   └─ CMV by product
   │
   ├─→ Manager analyzes results:
   │   │
   │   ├─→ IF CMV% is HIGH (> 40%):
   │   │   │
   │   │   ├─→ Review top CMV products
   │   │   │
   │   │   ├─→ FOR EACH HIGH-CMV PRODUCT:
   │   │   │   ├─→ Check recipe accuracy
   │   │   │   ├─→ Review portion sizes
   │   │   │   ├─→ Analyze waste
   │   │   │   ├─→ Consider price adjustment
   │   │   │   └─→ Update recipe if needed
   │   │   │
   │   │   ├─→ Review purchasing:
   │   │   │   ├─→ Check supplier prices
   │   │   │   ├─→ Look for alternatives
   │   │   │   └─→ Negotiate better rates
   │   │   │
   │   │   └─→ Investigate losses:
   │   │       ├─→ Review appraisal divergences
   │   │       ├─→ Check for waste patterns
   │   │       └─→ Implement controls
   │   │
   │   ├─→ IF CMV% is LOW (< 25%):
   │   │   │
   │   │   ├─→ Verify data accuracy:
   │   │   │   ├─→ Check all purchases recorded
   │   │   │   ├─→ Verify closing stock
   │   │   │   └─→ Confirm revenue data
   │   │   │
   │   │   └─→ IF data is correct:
   │   │       └─→ Consider menu optimization
   │   │
   │   └─→ IF CMV% is NORMAL (30-35%):
   │       │
   │       ├─→ Review product margins
   │       │
   │       ├─→ Identify improvement opportunities
   │       │
   │       └─→ Continue monitoring
   │
   ├─→ Manager takes actions:
   │   ├─ Update recipes
   │   ├─ Adjust prices
   │   ├─ Train staff
   │   ├─ Implement controls
   │   └─ Document decisions
   │
   ├─→ Manager exports report for:
   │   ├─ Financial records
   │   ├─ Management meetings
   │   └─ Stakeholder reports
   │
   └─→ [END]
```

---

## Integration Workflows

### Workflow 6: Automatic Purchase Recording

```
┌─────────────────────────────────────────────────────────────┐
│          AUTOMATIC PURCHASE RECORDING WORKFLOW               │
└─────────────────────────────────────────────────────────────┘

[TRIGGER: Stock transaction created]
   │
   ├─→ System detects new stock transaction
   │
   ├─→ System checks transaction type
   │   │
   │   ├─→ IF type = "purchase":
   │   │   │
   │   │   ├─→ System checks for open CMV period
   │   │   │
   │   │   ├─→ IF open period exists:
   │   │   │   │
   │   │   │   ├─→ System validates transaction date:
   │   │   │   │   ├─ Date within period? → Continue
   │   │   │   │   └─ Date outside? → Skip
   │   │   │   │
   │   │   │   ├─→ System calculates purchase value:
   │   │   │   │   └─ Value = quantity × unit cost
   │   │   │   │
   │   │   │   ├─→ System adds to period.purchases
   │   │   │   │
   │   │   │   ├─→ System creates purchase record:
   │   │   │   │   ├─ ingredientId
   │   │   │   │   ├─ quantity
   │   │   │   │   ├─ unitCost
   │   │   │   │   ├─ totalValue
   │   │   │   │   └─ transactionDate
   │   │   │   │
   │   │   │   └─→ System updates period total
   │   │   │
   │   │   └─→ IF no open period:
   │   │       └─→ Skip (no action needed)
   │   │
   │   └─→ IF type != "purchase":
   │       └─→ Skip (not relevant for CMV)
   │
   └─→ [END]
```

### Workflow 7: Sales Revenue Tracking

```
┌─────────────────────────────────────────────────────────────┐
│            SALES REVENUE TRACKING WORKFLOW                   │
└─────────────────────────────────────────────────────────────┘

[TRIGGER: Order completed/paid]
   │
   ├─→ System detects order completion
   │
   ├─→ System checks for open CMV period
   │
   ├─→ IF open period exists:
   │   │
   │   ├─→ System validates order date:
   │   │   ├─ Date within period? → Continue
   │   │   └─ Date outside? → Skip
   │   │
   │   ├─→ System extracts order data:
   │   │   ├─ Order total
   │   │   └─ Order items (products + quantities)
   │   │
   │   ├─→ System adds to period.revenue
   │   │
   │   ├─→ FOR EACH ORDER ITEM:
   │   │   │
   │   │   ├─→ System finds/creates CMVProduct record
   │   │   │
   │   │   ├─→ System updates:
   │   │   │   ├─ quantitySold += item.quantity
   │   │   │   └─ revenue += item.total
   │   │   │
   │   │   └─→ System calculates cost:
   │   │       ├─ Get product recipe
   │   │       ├─ cost = recipe.costPerPortion × quantity
   │   │       └─ Update CMVProduct.cost
   │   │
   │   └─→ System saves updates
   │
   └─→ [END]
```

### Workflow 8: Stock Adjustment Integration

```
┌─────────────────────────────────────────────────────────────┐
│          STOCK ADJUSTMENT INTEGRATION WORKFLOW               │
└─────────────────────────────────────────────────────────────┘

[TRIGGER: Appraisal approved]
   │
   ├─→ System begins stock adjustment process
   │
   ├─→ System starts database transaction
   │
   ├─→ FOR EACH APPRAISAL ITEM:
   │   │
   │   ├─→ System gets ingredient
   │   │
   │   ├─→ System calculates adjustment:
   │   │   └─ adjustment = physicalQuantity - theoreticalQuantity
   │   │
   │   ├─→ System updates ingredient:
   │   │   └─ currentStock = physicalQuantity
   │   │
   │   ├─→ System creates stock transaction:
   │   │   ├─ type = "adjustment"
   │   │   ├─ quantity = adjustment
   │   │   ├─ reason = "Stock appraisal adjustment"
   │   │   ├─ reference = appraisalId
   │   │   └─ userId = approver
   │   │
   │   └─→ System creates audit log:
   │       ├─ action = "STOCK_ADJUSTED"
   │       ├─ ingredientId
   │       ├─ previousQuantity = theoreticalQuantity
   │       ├─ newQuantity = physicalQuantity
   │       └─ appraisalId
   │
   ├─→ System commits transaction
   │
   ├─→ IF transaction fails:
   │   ├─→ System rolls back all changes
   │   ├─→ System logs error
   │   └─→ System notifies user
   │
   └─→ [END]
```

---

## Error Handling Workflows

### Workflow 9: Validation Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│           VALIDATION ERROR HANDLING WORKFLOW                 │
└─────────────────────────────────────────────────────────────┘

[TRIGGER: Validation error occurs]
   │
   ├─→ System catches validation error
   │
   ├─→ System determines error type:
   │   │
   │   ├─→ MISSING REQUIRED FIELD:
   │   │   ├─→ Highlight field in red
   │   │   ├─→ Show error message below field
   │   │   └─→ Focus on first error field
   │   │
   │   ├─→ INVALID FORMAT:
   │   │   ├─→ Show format requirements
   │   │   ├─→ Provide example
   │   │   └─→ Keep user input (don't clear)
   │   │
   │   ├─→ BUSINESS RULE VIOLATION:
   │   │   ├─→ Show clear explanation
   │   │   ├─→ Suggest corrective action
   │   │   └─→ Provide help link if available
   │   │
   │   └─→ PERMISSION ERROR:
   │       ├─→ Show permission required
   │       ├─→ Suggest contacting manager
   │       └─→ Log security event
   │
   ├─→ System prevents form submission
   │
   ├─→ System keeps form data (no data loss)
   │
   └─→ [WAIT FOR USER CORRECTION]
```

### Workflow 10: System Error Recovery

```
┌─────────────────────────────────────────────────────────────┐
│            SYSTEM ERROR RECOVERY WORKFLOW                    │
└─────────────────────────────────────────────────────────────┘

[TRIGGER: System error occurs]
   │
   ├─→ System catches error
   │
   ├─→ System logs error details:
   │   ├─ Error message
   │   ├─ Stack trace
   │   ├─ User ID
   │   ├─ Request data
   │   └─ Timestamp
   │
   ├─→ System determines severity:
   │   │
   │   ├─→ CRITICAL (data loss risk):
   │   │   ├─→ Roll back transaction
   │   │   ├─→ Send alert to admin
   │   │   ├─→ Show user-friendly error
   │   │   └─→ Offer retry option
   │   │
   │   ├─→ HIGH (feature unavailable):
   │   │   ├─→ Log error
   │   │   ├─→ Show error message
   │   │   ├─→ Suggest alternative action
   │   │   └─→ Provide support contact
   │   │
   │   └─→ MEDIUM (degraded experience):
   │       ├─→ Log warning
   │       ├─→ Show warning message
   │       ├─→ Allow user to continue
   │       └─→ Use fallback behavior
   │
   ├─→ System preserves user data when possible
   │
   ├─→ System offers recovery options:
   │   ├─ Retry operation
   │   ├─ Save draft
   │   ├─ Contact support
   │   └─ Return to safe state
   │
   └─→ [END]
```

---

## Workflow Summary

### Key Workflows

1. **Complete Stock Appraisal**: Full inventory counting and approval process
2. **Quick Daily Appraisal**: Streamlined process for high-value items
3. **Critical Divergence Handling**: Special process for significant differences
4. **Complete CMV Period**: Full period lifecycle from creation to closing
5. **CMV Analysis**: Post-period analysis and action planning
6. **Automatic Purchase Recording**: Integration with stock transactions
7. **Sales Revenue Tracking**: Integration with order system
8. **Stock Adjustment**: Automatic stock updates after approval
9. **Validation Error Handling**: User-friendly error management
10. **System Error Recovery**: Robust error handling and recovery

### Workflow Best Practices

1. **Always follow the complete workflow** - Don't skip steps
2. **Validate at each stage** - Catch errors early
3. **Document divergences** - Always add reasons for significant differences
4. **Review before approving** - Double-check critical data
5. **Monitor integrations** - Ensure automatic processes are working
6. **Handle errors gracefully** - Provide clear guidance to users
7. **Maintain audit trail** - Log all important actions
8. **Test edge cases** - Verify workflows handle unusual scenarios

---

**Version**: 1.0  
**Last Updated**: 06/11/2025  
**For**: Restaurant API Core v1.0
