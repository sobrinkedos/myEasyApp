# Stock Appraisal & CMV FAQ

## Frequently Asked Questions

---

## General Questions

### Q: What is the difference between Stock Appraisal and CMV?

**A:** Stock Appraisal (Conferência de Estoque) is the process of physically counting your inventory and comparing it with the system's theoretical stock. CMV (Custo de Mercadoria Vendida / Cost of Goods Sold) is the calculation of how much your sold products actually cost during a specific period.

Think of it this way:
- **Stock Appraisal** = "How accurate is my inventory?"
- **CMV** = "How much did my sales cost me?"

### Q: How often should I perform stock appraisals?

**A:** It depends on your operation:

- **Daily**: For high-value items (meat, seafood, premium ingredients)
- **Weekly**: For most restaurants with moderate volume
- **Monthly**: Minimum requirement for financial reporting and CMV calculation

Best practice: Weekly full appraisals + daily spot checks on critical items.

### Q: Do I need to count every single item?

**A:** For monthly appraisals (used for CMV), yes - you should count all items. For daily/weekly appraisals, you can focus on:
- High-value items
- Fast-moving items
- Items with historical divergences
- Perishable items

### Q: What's a good accuracy percentage?

**A:**
- **Excellent**: > 95%
- **Good**: 90-95%
- **Needs Improvement**: 85-90%
- **Critical**: < 85%

If your accuracy is consistently below 90%, investigate your processes, training, and controls.

### Q: What's a normal CMV percentage?

**A:** It varies by business type:

- **Fine Dining**: 28-35%
- **Casual Dining**: 30-35%
- **Fast Food**: 25-30%
- **Bar/Pub**: 20-25%
- **Café**: 25-30%

If your CMV is significantly higher, you may have issues with waste, theft, pricing, or portion control.

---

## Stock Appraisal Questions

### Q: Why is my theoretical stock different from my physical count?

**A:** Common reasons include:

1. **Normal variance**: Spillage, evaporation, trimming waste
2. **Portioning errors**: Staff using more/less than recipe specifies
3. **Unrecorded usage**: Items used but not recorded in system
4. **Data entry errors**: Incorrect quantities entered for purchases or sales
5. **Theft or loss**: Unfortunately, this can happen
6. **Recipe inaccuracies**: Recipes not reflecting actual usage
7. **Unit conversion errors**: Mixing up kg/g, L/mL, etc.

### Q: Can I edit an appraisal after it's approved?

**A:** No. Once an appraisal is approved, it cannot be edited because:
1. It has already adjusted your theoretical stock
2. It may be used in CMV calculations
3. It serves as an audit record

If you discover an error after approval, you should:
1. Document the error
2. Perform a new appraisal to correct the stock
3. Add notes explaining the correction

### Q: What should I do if I find a large divergence (> 20%)?

**A:**

1. **Recount immediately** - Verify the physical count
2. **Check the unit** - Ensure you're using the correct unit (kg vs g, L vs mL)
3. **Review recent transactions** - Look for unrecorded purchases or usage
4. **Investigate with staff** - Ask who last used the item
5. **Check storage areas** - Item might be in a different location
6. **Document everything** - Add detailed notes about the investigation
7. **Report to manager** - Large divergences require management attention

### Q: How long does a stock appraisal take?

**A:**
- **Daily (critical items only)**: 15-30 minutes
- **Weekly (full inventory)**: 1-2 hours
- **Monthly (complete with storage)**: 2-4 hours

Time varies based on:
- Number of items
- Storage organization
- Team size
- Experience level

### Q: Can multiple people work on the same appraisal?

**A:** Yes! Best practice is to have:
- **Counter**: Physically counts items
- **Recorder**: Enters quantities in system
- **Verifier**: Double-checks critical items

This reduces errors and speeds up the process.

### Q: What if I can't count an item right now?

**A:** You have options:

1. **Skip temporarily**: Count other items first, come back to it
2. **Estimate conservatively**: Better than leaving blank, but mark for recount
3. **Mark as "needs recount"**: Add note and complete later
4. **Use last known quantity**: Only if item is rarely used

For monthly appraisals, all items must be counted before approval.

### Q: Should I count items that are almost empty?

**A:** Yes! Even small quantities matter for accuracy. Use appropriate measuring tools:
- Kitchen scale for small amounts
- Measuring cups for liquids
- Count individual units

### Q: What happens to my stock when I approve an appraisal?

**A:** The system:
1. Updates theoretical stock to match your physical count
2. Creates stock adjustment transactions
3. Records the approval in audit log
4. Generates alerts if accuracy is low

Your new theoretical stock becomes the baseline for future calculations.

---

## CMV Questions

### Q: Why do I need both opening and closing appraisals for CMV?

**A:** The CMV formula requires accurate stock values:

```
CMV = Opening Stock + Purchases - Closing Stock
```

Without accurate appraisals:
- Opening stock might be wrong (from previous period errors)
- Closing stock might be wrong (current period errors)
- CMV calculation will be inaccurate

### Q: Can I have multiple CMV periods open at the same time?

**A:** No. Only one period can be open at a time to ensure:
- Purchases are recorded in the correct period
- Sales are tracked accurately
- No confusion about which period a transaction belongs to

### Q: What if I forgot to record a purchase during the period?

**A:** If the period is still open:
1. Add the purchase transaction with the correct date
2. System will automatically include it in the period

If the period is closed:
1. You cannot modify it
2. Document the error
3. Consider the impact on your analysis
4. Be more careful in the next period

### Q: My CMV percentage seems too high. What should I check?

**A:**

1. **Verify closing stock**: Was the closing appraisal accurate?
2. **Check all purchases recorded**: Missing purchases lower CMV
3. **Verify revenue**: Incorrect revenue affects CMV%
4. **Review recipe costs**: Are they up to date?
5. **Investigate waste**: High waste increases CMV
6. **Check portion sizes**: Oversized portions increase CMV
7. **Look for theft**: Unfortunately, this affects CMV

### Q: My CMV percentage seems too low. What should I check?

**A:**

1. **Verify opening stock**: Was it accurate?
2. **Check all purchases recorded**: Extra purchases increase CMV
3. **Verify closing stock**: Overestimated closing stock lowers CMV
4. **Check revenue**: Underreported revenue increases CMV%
5. **Review calculations**: Ensure formulas are correct

### Q: How do I compare CMV between periods of different lengths?

**A:** Use CMV percentage (CMV%), not absolute CMV value:

```
CMV% = (CMV / Revenue) × 100
```

This normalizes for different period lengths and revenue levels.

Example:
- Week 1: CMV = R$ 3,000, Revenue = R$ 10,000, CMV% = 30%
- Month 1: CMV = R$ 12,000, Revenue = R$ 40,000, CMV% = 30%

Both have the same efficiency despite different absolute values.

### Q: What's the difference between CMV and gross margin?

**A:**
- **CMV**: Cost of products sold (what you spent on ingredients)
- **Gross Margin**: Revenue minus CMV (what you earned after ingredient costs)

```
Gross Margin = Revenue - CMV
Gross Margin% = (Gross Margin / Revenue) × 100
```

Example:
- Revenue: R$ 10,000
- CMV: R$ 3,000
- Gross Margin: R$ 7,000 (70%)

### Q: Should I include labor costs in CMV?

**A:** No. CMV only includes:
- Ingredient costs
- Food costs
- Beverage costs

Labor, rent, utilities, and other operating expenses are separate and calculated differently.

### Q: Can I delete a closed CMV period?

**A:** No. Closed periods are locked for audit purposes. They serve as:
- Financial records
- Historical data for analysis
- Audit trail
- Trend analysis baseline

If there's an error, document it and adjust future periods accordingly.

---

## Technical Questions

### Q: Why can't I approve an appraisal?

**A:** Common reasons:

1. **Not all items counted**: Complete all item counts first
2. **Not a manager**: Only managers can approve appraisals
3. **Already approved**: Appraisal is already approved
4. **System error**: Check your connection and try again

### Q: Why can't I close a CMV period?

**A:** Common reasons:

1. **No closing appraisal**: Perform and approve a closing appraisal first
2. **Closing appraisal not approved**: Manager must approve it
3. **Not a manager**: Only managers can close periods
4. **Period dates invalid**: Check start and end dates
5. **Another period is open**: Close or delete the other period first

### Q: What happens if I lose internet connection during counting?

**A:** The system saves your progress:
- Each item is saved when you move to the next
- If connection is lost, data is cached locally
- When connection returns, data syncs automatically
- You won't lose your work

Best practice: Save frequently by clicking "Save Progress" button.

### Q: Can I export my data?

**A:** Yes! You can export:
- Individual appraisal reports (PDF)
- CMV period reports (PDF)
- Comparison reports (PDF)
- Historical data (CSV - contact support)

### Q: How far back can I view historical data?

**A:** All data is retained indefinitely:
- All appraisals are accessible
- All CMV periods are accessible
- Audit logs are maintained
- Reports can be regenerated

### Q: Can I customize the accuracy thresholds?

**A:** Currently, thresholds are fixed:
- Green: > 95%
- Yellow: 90-95%
- Red: < 90%

Contact support if you need custom thresholds for your operation.

---

## Troubleshooting

### Q: The system shows an error when I try to create an appraisal. What should I do?

**A:**

1. **Check required fields**: Ensure date and type are filled
2. **Check date format**: Use the date picker
3. **Refresh the page**: Sometimes helps with temporary issues
4. **Clear browser cache**: Old data might be causing issues
5. **Try different browser**: Rule out browser-specific issues
6. **Contact support**: If error persists

### Q: My divergence calculation seems wrong. What could be the issue?

**A:**

1. **Check units**: Ensure theoretical and physical use same unit
2. **Check decimal places**: 2.5 kg vs 25 kg makes a big difference
3. **Verify unit cost**: Incorrect cost affects value calculation
4. **Check ingredient data**: Ensure ingredient info is correct
5. **Recalculate**: Click "Recalculate" button if available

### Q: I accidentally deleted an appraisal. Can I recover it?

**A:**
- **If not approved**: Unfortunately, no. You'll need to create a new one
- **If approved**: Contact support immediately - they may be able to help

Prevention: Be careful with delete actions, especially for approved appraisals.

### Q: The system is slow when loading appraisals. Why?

**A:** Possible reasons:

1. **Large number of items**: Many ingredients slow down loading
2. **Slow internet**: Check your connection
3. **Server load**: Peak usage times may be slower
4. **Browser issues**: Try clearing cache or using different browser

If persistent, contact support.

### Q: I see different numbers in the report vs. the appraisal page. Why?

**A:**

1. **Timing**: Report might be cached, refresh it
2. **Filters**: Check if filters are applied differently
3. **Rounding**: Display rounding vs. calculation precision
4. **Data sync**: Wait a moment and refresh

If numbers don't match after refresh, contact support.

---

## Best Practices

### Q: What's the best time to perform appraisals?

**A:**
- **Before opening**: Stock is organized, no interruptions
- **After closing**: All sales are recorded, accurate theoretical stock
- **Avoid**: During busy service times

Consistency is key - same time each period.

### Q: How can I improve my accuracy percentage?

**A:**

1. **Train staff**: Proper portioning and recording
2. **Organize storage**: Easy to find and count items
3. **Use proper tools**: Scales, measuring cups, etc.
4. **Count carefully**: Don't rush, double-check critical items
5. **Update recipes**: Ensure recipes match actual usage
6. **Reduce waste**: Better handling and storage
7. **Implement controls**: Prevent theft and unauthorized usage
8. **Regular appraisals**: More frequent = better accuracy

### Q: Should I perform appraisals on the same day each week/month?

**A:** Yes! Consistency helps:
- Staff knows when to expect it
- Easier to compare periods
- Better for scheduling
- Builds routine and discipline

### Q: How should I organize my team for appraisals?

**A:**

**Small operation (1-2 people)**:
- One person counts and records
- Manager verifies and approves

**Medium operation (3-5 people)**:
- Team 1: Dry storage
- Team 2: Refrigerated items
- Team 3: Freezer items
- Manager: Verifies and approves

**Large operation (6+ people)**:
- Multiple teams by area
- Dedicated recorder
- Supervisor per team
- Manager: Final review and approval

### Q: What should I do with items that are partially used?

**A:**

1. **Weigh it**: Use a scale for accurate measurement
2. **Estimate percentage**: If weighing isn't practical (e.g., 75% of a bottle)
3. **Convert to base unit**: Record in system's unit (kg, L, etc.)
4. **Be consistent**: Use same method each time

---

## Integration Questions

### Q: How does the system know my theoretical stock?

**A:** The system calculates theoretical stock based on:
- Previous appraisal (baseline)
- Purchases (additions)
- Sales/usage (subtractions)
- Adjustments (manual corrections)

Formula: `Theoretical = Previous + Purchases - Usage`

### Q: Are purchases automatically added to CMV periods?

**A:** Yes! When you:
1. Create a stock purchase transaction
2. During an open CMV period
3. System automatically adds it to period.purchases

No manual entry needed.

### Q: How does the system track sales for CMV?

**A:** When an order is completed:
1. System records the sale
2. Calculates ingredient usage based on recipes
3. Adds revenue to CMV period
4. Tracks product-level sales for CMV by product

All automatic - no manual entry needed.

### Q: What if I use ingredients outside of recipes (e.g., staff meals)?

**A:** You should:
1. Record it as a stock transaction (type: "usage")
2. Add reason: "Staff meal" or "Sampling"
3. System will adjust theoretical stock
4. Won't affect CMV (not a sale)

This keeps your theoretical stock accurate.

---

## Support

### Q: Where can I get more help?

**A:**

1. **User Guide**: See STOCK_APPRAISAL_CMV_USER_GUIDE.md
2. **API Documentation**: See STOCK_APPRAISAL_CMV_API.md
3. **Workflows**: See STOCK_APPRAISAL_CMV_WORKFLOWS.md
4. **Contact Support**:
   - Email: support@restaurantapi.com
   - Phone: [Support Number]
   - Hours: Monday-Friday, 9am-6pm

### Q: How do I report a bug?

**A:**

1. **Document the issue**:
   - What you were trying to do
   - What happened
   - What you expected to happen
   - Screenshots if possible

2. **Contact support** with:
   - Your user ID
   - Date and time of issue
   - Steps to reproduce
   - Error messages

3. **Workaround**: Ask support if there's a temporary workaround

### Q: Can I request new features?

**A:** Yes! We welcome feedback:
1. Email feature requests to: features@restaurantapi.com
2. Include:
   - Description of desired feature
   - Why it would be useful
   - How you would use it
3. We review all requests for future updates

### Q: Is there training available?

**A:** Yes:
- **Online documentation**: Available 24/7
- **Video tutorials**: Coming soon
- **Live training**: Contact support to schedule
- **Onboarding**: Available for new customers

---

## Glossary

**Appraisal**: Physical inventory count  
**Theoretical Stock**: System-calculated inventory  
**Physical Stock**: Actual counted inventory  
**Divergence**: Difference between theoretical and physical  
**Accuracy**: Percentage of inventory correctness  
**CMV**: Cost of Goods Sold (Custo de Mercadoria Vendida)  
**Opening Stock**: Inventory value at period start  
**Closing Stock**: Inventory value at period end  
**Gross Margin**: Revenue minus CMV  
**CMV%**: CMV as percentage of revenue  

---

**Version**: 1.0  
**Last Updated**: 06/11/2025  
**For**: Restaurant API Core v1.0

---

## Quick Reference

### Accuracy Levels
- 🟢 Excellent: > 95%
- 🟡 Good: 90-95%
- 🔴 Needs Improvement: < 90%

### CMV% Targets (Casual Dining)
- Ideal: 30-35%
- Acceptable: 35-40%
- High: > 40%

### Appraisal Frequency
- Daily: Critical items only
- Weekly: Full inventory
- Monthly: Complete with CMV

### Support Contact
- Email: support@restaurantapi.com
- Phone: [Support Number]
- Hours: Mon-Fri, 9am-6pm
