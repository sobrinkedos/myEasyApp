# Stock Appraisal & CMV System Documentation

## Overview

Welcome to the Stock Appraisal and CMV (Cost of Goods Sold) system documentation. This comprehensive system helps restaurants manage inventory accuracy and calculate the true cost of their operations.

---

## What's Included

This system provides two main features:

### 1. Stock Appraisal (Conferência de Estoque)
Physical inventory counting and accuracy tracking to ensure your recorded stock matches reality.

**Key Benefits**:
- Identify inventory discrepancies
- Detect losses, waste, or theft
- Improve inventory accuracy over time
- Make informed purchasing decisions

### 2. CMV Calculation (Custo de Mercadoria Vendida)
Automatic calculation of Cost of Goods Sold to understand your true product costs and profit margins.

**Key Benefits**:
- Calculate actual profit margins
- Identify cost trends
- Optimize pricing strategies
- Control food costs effectively

---

## Documentation Structure

### 📘 [API Documentation](./STOCK_APPRAISAL_CMV_API.md)
Complete API reference for developers integrating with the system.

**Contents**:
- Stock Appraisal endpoints
- CMV Period endpoints
- Report endpoints
- Request/response examples
- Error handling
- Authentication requirements

**Use this when**: Building integrations, developing features, or troubleshooting API issues.

---

### 📗 [User Guide](./STOCK_APPRAISAL_CMV_USER_GUIDE.md)
Comprehensive guide for end users on how to use the system effectively.

**Contents**:
- Getting started
- Step-by-step instructions
- Understanding accuracy and CMV
- Reports and analytics
- Best practices
- Troubleshooting

**Use this when**: Training staff, learning the system, or looking for best practices.

---

### 📙 [Workflows](./STOCK_APPRAISAL_CMV_WORKFLOWS.md)
Detailed workflow diagrams showing how processes work from start to finish.

**Contents**:
- Stock appraisal workflows
- CMV period workflows
- Integration workflows
- Error handling workflows
- Visual process diagrams

**Use this when**: Understanding system processes, training teams, or documenting procedures.

---

### 📕 [FAQ](./STOCK_APPRAISAL_CMV_FAQ.md)
Frequently asked questions and answers covering common scenarios and issues.

**Contents**:
- General questions
- Stock appraisal questions
- CMV questions
- Technical questions
- Troubleshooting
- Best practices

**Use this when**: Looking for quick answers, troubleshooting issues, or learning tips.

---

## Quick Start Guide

### For Restaurant Staff

1. **Read the User Guide** - Start with [STOCK_APPRAISAL_CMV_USER_GUIDE.md](./STOCK_APPRAISAL_CMV_USER_GUIDE.md)
2. **Understand the workflows** - Review [STOCK_APPRAISAL_CMV_WORKFLOWS.md](./STOCK_APPRAISAL_CMV_WORKFLOWS.md)
3. **Perform your first appraisal** - Follow the step-by-step guide
4. **Check the FAQ** - [STOCK_APPRAISAL_CMV_FAQ.md](./STOCK_APPRAISAL_CMV_FAQ.md) for common questions

### For Managers

1. **Understand CMV** - Read the CMV section in the User Guide
2. **Set up your first period** - Follow the CMV workflow
3. **Review reports** - Learn how to analyze results
4. **Implement best practices** - Use the recommendations in the User Guide

### For Developers

1. **Review API Documentation** - [STOCK_APPRAISAL_CMV_API.md](./STOCK_APPRAISAL_CMV_API.md)
2. **Understand workflows** - [STOCK_APPRAISAL_CMV_WORKFLOWS.md](./STOCK_APPRAISAL_CMV_WORKFLOWS.md)
3. **Check integration points** - See how the system integrates with other modules
4. **Test endpoints** - Use the API examples to test functionality

---

## Key Concepts

### Stock Appraisal

**Theoretical Stock**: Quantity calculated by the system based on purchases and sales  
**Physical Stock**: Actual quantity counted during appraisal  
**Divergence**: Difference between theoretical and physical stock  
**Accuracy**: Percentage indicating how close physical stock is to theoretical

**Formula**:
```
Accuracy = (1 - |Total Divergence Value| / Total Theoretical Value) × 100
```

**Accuracy Levels**:
- 🟢 **Excellent**: > 95%
- 🟡 **Good**: 90-95%
- 🔴 **Needs Improvement**: < 90%

### CMV (Cost of Goods Sold)

**Opening Stock**: Inventory value at the start of the period  
**Purchases**: Total cost of ingredients purchased during the period  
**Closing Stock**: Inventory value at the end of the period  
**CMV**: The cost of products that were sold

**Formula**:
```
CMV = Opening Stock + Purchases - Closing Stock
CMV% = (CMV / Revenue) × 100
```

**Ideal CMV% by Business Type**:
- Fine Dining: 28-35%
- Casual Dining: 30-35%
- Fast Food: 25-30%
- Bar/Pub: 20-25%
- Café: 25-30%

---

## System Features

### Stock Appraisal Features

✅ **Multiple Appraisal Types**
- Daily (quick checks on critical items)
- Weekly (regular full inventory)
- Monthly (comprehensive for CMV)

✅ **Visual Indicators**
- Color-coded divergences (green/yellow/red)
- Real-time accuracy calculation
- Critical item highlighting

✅ **Flexible Counting**
- Count items in any order
- Save progress automatically
- Add notes and reasons for divergences

✅ **Approval Workflow**
- Manager approval required
- Automatic stock adjustment
- Audit trail maintained

✅ **Comprehensive Reports**
- Accuracy trends over time
- Critical divergence reports
- PDF export for documentation

### CMV Features

✅ **Automatic Tracking**
- Purchases recorded automatically
- Sales tracked from orders
- Real-time CMV preview

✅ **Period Management**
- Daily, weekly, or monthly periods
- Opening and closing stock integration
- Period comparison reports

✅ **Product-Level Analysis**
- CMV by individual product
- Margin calculation per product
- Identify most/least profitable items

✅ **Comprehensive Reports**
- Period summary reports
- CMV by category
- Trend analysis
- PDF export

✅ **Integration**
- Seamless integration with stock transactions
- Automatic recipe cost calculation
- Order system integration

---

## System Architecture

### Technology Stack

**Backend**:
- Node.js 20 LTS
- TypeScript 5.x
- Express.js 4.x
- Prisma ORM 5.x
- PostgreSQL 16

**Frontend**:
- React 18
- TypeScript
- React Router
- Axios
- Chart.js

### Database Models

**StockAppraisal**:
- Stores appraisal header information
- Tracks status (pending/completed/approved)
- Calculates overall accuracy

**StockAppraisalItem**:
- Individual ingredient counts
- Theoretical vs physical quantities
- Divergence calculations

**CMVPeriod**:
- Period definition and status
- Opening/closing stock values
- CMV calculations

**CMVProduct**:
- Product-level CMV tracking
- Sales and cost per product
- Margin calculations

### Integration Points

1. **Stock Transactions**: Automatic purchase recording
2. **Orders**: Sales and revenue tracking
3. **Recipes**: Cost calculation per product
4. **Ingredients**: Current stock management
5. **Audit Log**: Complete action history

---

## Security & Permissions

### Role-Based Access

**All Authenticated Users**:
- View appraisals and CMV periods
- Create appraisals
- Count items
- View reports

**Managers Only**:
- Approve appraisals
- Create CMV periods
- Close CMV periods
- Delete appraisals/periods

### Audit Trail

All critical actions are logged:
- Appraisal creation and approval
- Stock adjustments
- CMV period creation and closing
- User actions and timestamps

---

## Performance Considerations

### Optimization Strategies

1. **Database Indexing**: Optimized queries for frequent operations
2. **Caching**: Reports and calculations cached when appropriate
3. **Batch Processing**: Items processed in batches for large appraisals
4. **Pagination**: Large lists paginated for better performance

### Best Practices

- Perform appraisals during off-peak hours
- Close CMV periods promptly
- Archive old data periodically
- Monitor system performance

---

## Common Workflows

### Daily Operations

```
Morning:
1. Quick appraisal of critical items (15-30 min)
2. Review any alerts from previous day
3. Check current CMV period status

During Service:
- System automatically tracks sales
- Purchases recorded as they arrive

End of Day:
- Review daily summary
- Address any critical divergences
```

### Weekly Operations

```
1. Perform full stock appraisal (1-2 hours)
2. Manager reviews and approves
3. Analyze accuracy trends
4. Address recurring divergences
5. Update procedures if needed
```

### Monthly Operations

```
1. Perform comprehensive appraisal (2-4 hours)
2. Manager approves appraisal
3. Close CMV period
4. Generate and review CMV report
5. Analyze product margins
6. Make pricing/menu decisions
7. Create new CMV period
8. Export reports for accounting
```

---

## Troubleshooting Quick Reference

### Low Accuracy (< 90%)

**Check**:
- Counting accuracy
- Recipe calculations
- Unrecorded transactions
- Staff training needs

**Action**:
- Recount critical items
- Review and update recipes
- Audit recent transactions
- Implement better controls

### High CMV (> 40%)

**Check**:
- Portion sizes
- Waste levels
- Recipe costs
- Pricing strategy

**Action**:
- Review portion control
- Investigate waste sources
- Update recipe costs
- Consider price adjustments

### Cannot Approve Appraisal

**Check**:
- All items counted?
- User has manager role?
- Appraisal already approved?

**Action**:
- Complete all counts
- Contact manager
- Check appraisal status

### Cannot Close CMV Period

**Check**:
- Closing appraisal exists?
- Closing appraisal approved?
- User has manager role?

**Action**:
- Perform closing appraisal
- Get manager approval
- Verify permissions

---

## Support & Resources

### Documentation

- **API Reference**: [STOCK_APPRAISAL_CMV_API.md](./STOCK_APPRAISAL_CMV_API.md)
- **User Guide**: [STOCK_APPRAISAL_CMV_USER_GUIDE.md](./STOCK_APPRAISAL_CMV_USER_GUIDE.md)
- **Workflows**: [STOCK_APPRAISAL_CMV_WORKFLOWS.md](./STOCK_APPRAISAL_CMV_WORKFLOWS.md)
- **FAQ**: [STOCK_APPRAISAL_CMV_FAQ.md](./STOCK_APPRAISAL_CMV_FAQ.md)

### Contact Support

- **Email**: support@restaurantapi.com
- **Phone**: [Support Number]
- **Hours**: Monday-Friday, 9am-6pm

### Training Resources

- Online documentation (available 24/7)
- Video tutorials (coming soon)
- Live training (contact support)
- Onboarding for new customers

---

## Version History

### Version 1.0 (06/11/2025)
- Initial release
- Stock Appraisal module
- CMV Period module
- Comprehensive reporting
- API documentation
- User guide
- Workflows
- FAQ

---

## Feedback & Feature Requests

We welcome your feedback! Contact us:
- **Feature Requests**: features@restaurantapi.com
- **Bug Reports**: support@restaurantapi.com
- **General Feedback**: feedback@restaurantapi.com

---

## License & Copyright

**Restaurant API Core v1.0**  
© 2025 All Rights Reserved

---

## Quick Links

- [API Documentation](./STOCK_APPRAISAL_CMV_API.md)
- [User Guide](./STOCK_APPRAISAL_CMV_USER_GUIDE.md)
- [Workflows](./STOCK_APPRAISAL_CMV_WORKFLOWS.md)
- [FAQ](./STOCK_APPRAISAL_CMV_FAQ.md)

---

**Last Updated**: 06/11/2025  
**Version**: 1.0  
**For**: Restaurant API Core v1.0
