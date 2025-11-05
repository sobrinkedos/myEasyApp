# Sistema de Gestão de Caixa - Implementation Plan

## Overview

Este plano detalha a implementação completa do Sistema de Gestão de Caixa, desde a estrutura de dados até a interface de usuário, incluindo toda a lógica de negócio, segurança e auditoria.

---

## Phase 1: Database and Core Models (5 tasks)

### Task 1.1: Create Prisma Schema for Cash Management
- [ ] 1.1 Add CashRegister model to Prisma schema
  - Define fields: id, number, name, establishmentId, isActive, timestamps
  - Add relation to Establishment
  - Add indexes for establishmentId
  - _Requirements: NFR-03_

- [ ] 1.2 Add CashSession model to Prisma schema
  - Define fields: id, cashRegisterId, operatorId, amounts, status, timestamps
  - Add enum CashSessionStatus (OPEN, CLOSED, TRANSFERRED, RECEIVED, REOPENED)
  - Add relations to CashRegister, User (operator and treasurer)
  - Add indexes for cashRegisterId, operatorId, status, openedAt
  - _Requirements: 1.1, 1.5, 7.1, 7.4_

- [ ] 1.3 Add CashTransaction model to Prisma schema
  - Define fields: id, cashSessionId, type, paymentMethod, amount, description, saleId, userId, timestamp
  - Add enum TransactionType (SALE, WITHDRAWAL, SUPPLY, OPENING, CLOSING, ADJUSTMENT)
  - Add enum PaymentMethod (CASH, DEBIT, CREDIT, PIX, VOUCHER, OTHER)
  - Add relations to CashSession, Sale, User
  - Add indexes for cashSessionId, type, timestamp
  - _Requirements: 2.1, 2.2, 2.5, 3.1, 3.4, 4.1, 4.4_

- [ ] 1.4 Add CashCount and CashTransfer models
  - Create CashCount model with denomination, quantity, total fields
  - Create CashTransfer model with transfer and receipt tracking
  - Add relations and indexes
  - _Requirements: 8.1, 8.2, 8.4, 9.1, 9.2, 9.4, 10.1, 10.2_

- [ ] 1.5 Run migrations and update database
  - Generate Prisma migration
  - Apply migration to database
  - Verify schema integrity
  - Create seed data for testing
  - _Requirements: NFR-05_

---

## Phase 2: Repository Layer (4 tasks)

### Task 2.1: Implement CashSession Repository
- [ ] 2.1 Create CashSessionRepository class
  - Implement create method for opening sessions
  - Implement findById with full relations
  - Implement findActiveByOperator method
  - Implement update method for status changes
  - Implement findMany with filters (status, operator, date range)
  - Add pagination support
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5_

### Task 2.2: Implement CashTransaction Repository
- [ ] 2.2 Create CashTransactionRepository class
  - Implement create method for transactions
  - Implement findBySession method
  - Implement getSessionBalance with aggregation query
  - Implement getTransactionsByType method
  - Implement cancel method (soft delete or status update)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

### Task 2.3: Implement CashCount Repository
- [ ] 2.3 Create CashCountRepository class
  - Implement createMany for batch insert
  - Implement findBySession method
  - Implement calculateTotal method
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

### Task 2.4: Implement CashTransfer Repository
- [ ] 2.4 Create CashTransferRepository class
  - Implement create method for transfers
  - Implement findPending method
  - Implement confirmReceipt method
  - Implement getDailyConsolidation with aggregation
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

---

## Phase 3: Business Logic Services (7 tasks)

### Task 3.1: Implement CashSessionService - Opening
- [ ] 3.1 Create CashSessionService class
  - Implement openSession method
  - Validate operator doesn't have open session
  - Validate opening amount range (R$ 50 - R$ 500)
  - Create session with status OPEN
  - Record opening transaction
  - Log audit action
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, BR-01, BR-02_

### Task 3.2: Implement CashSessionService - Closing
- [ ] 3.2 Implement closeSession method
  - Validate session exists and is OPEN
  - Calculate expected amount from transactions
  - Record cash counts
  - Calculate difference (quebra)
  - Validate justification if difference > 1%
  - Update session status to CLOSED
  - Notify supervisor if significant break
  - Log audit action
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, BR-04, BR-08_

### Task 3.3: Implement CashSessionService - Reopen
- [ ] 3.3 Implement reopenSession method
  - Validate user has supervisor permission
  - Validate session is CLOSED and within 24h
  - Update status to REOPENED
  - Record reopen reason
  - Log audit action with supervisor info
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, BR-07_

### Task 3.4: Implement TransactionService
- [ ] 3.4 Create TransactionService class
  - Implement recordSale method (auto-linked from sales)
  - Implement recordWithdrawal method with validations
  - Implement recordSupply method
  - Implement cancelTransaction method (supervisor only)
  - Implement getSessionBalance method
  - Implement getSessionTransactions method
  - Validate session is OPEN for all operations
  - Check authorization limits for withdrawals/supplies
  - Update session balance in real-time
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 15.1, 15.2, 15.3, 15.4, 15.5, BR-03_

### Task 3.5: Implement ClosingService
- [ ] 3.5 Create ClosingService class
  - Implement startClosing method (preview)
  - Implement recordCashCount method
  - Implement calculateDifference method
  - Implement finalizeClosure method
  - Generate closing report
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5, BR-09_

### Task 3.6: Implement TreasuryService
- [ ] 3.6 Create TreasuryService class
  - Implement transferToTreasury method
  - Calculate transfer amount (excluding opening amount)
  - Update session status to TRANSFERRED
  - Notify treasury of pending transfer
  - Implement confirmReceipt method
  - Record differences if any
  - Update status to RECEIVED
  - Implement listPendingTransfers method
  - Implement getDailyConsolidation method
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, BR-06, BR-10_

### Task 3.7: Implement AuditService
- [ ] 3.7 Create AuditService class
  - Implement logAction method
  - Store user, timestamp, IP, user agent
  - Store previous and new state for changes
  - Implement getAuditTrail method
  - Implement searchAuditLogs with filters
  - Implement generateAuditReport method
  - Ensure immutability of audit logs
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, NFR-08_

---

## Phase 4: API Controllers and Routes (6 tasks)

### Task 4.1: Implement CashSessionController
- [ ] 4.1 Create CashSessionController class
  - Implement POST /api/v1/cash/sessions (open)
  - Implement GET /api/v1/cash/sessions/active
  - Implement GET /api/v1/cash/sessions/:id
  - Implement POST /api/v1/cash/sessions/:id/close
  - Implement POST /api/v1/cash/sessions/:id/reopen (supervisor)
  - Implement GET /api/v1/cash/sessions (list with filters)
  - Add request validation with Zod
  - Add error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5, 13.1, 13.2, 13.3, 13.4, 13.5_

### Task 4.2: Implement TransactionController
- [ ] 4.2 Create TransactionController class
  - Implement POST /api/v1/cash/sessions/:id/withdrawals
  - Implement POST /api/v1/cash/sessions/:id/supplies
  - Implement GET /api/v1/cash/sessions/:id/transactions
  - Implement GET /api/v1/cash/sessions/:id/balance
  - Implement POST /api/v1/cash/transactions/:id/cancel (supervisor)
  - Add validation for amounts and reasons
  - Add authorization checks
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

### Task 4.3: Implement ClosingController
- [ ] 4.3 Create ClosingController class
  - Implement GET /api/v1/cash/sessions/:id/closing-preview
  - Implement POST /api/v1/cash/sessions/:id/cash-count
  - Add validation for cash count denominations
  - Calculate totals automatically
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5_

### Task 4.4: Implement TreasuryController
- [ ] 4.4 Create TreasuryController class
  - Implement POST /api/v1/cash/sessions/:id/transfer
  - Implement GET /api/v1/treasury/transfers/pending
  - Implement POST /api/v1/treasury/transfers/:id/confirm
  - Implement GET /api/v1/treasury/consolidation/daily
  - Add treasurer role validation
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

### Task 4.5: Implement ReportController
- [ ] 4.5 Create ReportController class
  - Implement GET /api/v1/cash/reports/session/:id
  - Implement GET /api/v1/cash/reports/daily
  - Implement GET /api/v1/cash/reports/cash-breaks
  - Implement GET /api/v1/cash/reports/operator-performance
  - Support multiple formats (JSON, PDF, EXCEL)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

### Task 4.6: Implement AuditController
- [ ] 4.6 Create AuditController class
  - Implement GET /api/v1/cash/audit/session/:id
  - Implement GET /api/v1/cash/audit/search
  - Add filters for audit search
  - Restrict access to authorized users only
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

---

## Phase 5: Security and Middleware (4 tasks)

### Task 5.1: Implement Authentication Middleware
- [ ] 5.1 Create cash-specific auth middleware
  - Implement requireCashOperator middleware
  - Implement requireSupervisor middleware
  - Implement requireTreasurer middleware
  - Validate JWT tokens
  - Check user roles and permissions
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, NFR-09, NFR-10_

### Task 5.2: Implement Validation Middleware
- [ ] 5.2 Create Zod schemas for all endpoints
  - OpenSessionSchema
  - CloseSessionSchema
  - WithdrawalSchema
  - SupplySchema
  - CashCountSchema
  - TransferSchema
  - ReceiptSchema
  - Add custom validators for business rules
  - _Requirements: BR-01, BR-02, BR-03, BR-04_

### Task 5.3: Implement Error Handling
- [ ] 5.3 Create custom error classes
  - SessionAlreadyOpenError
  - SessionNotFoundError
  - InvalidSessionStatusError
  - InsufficientCashError
  - AuthorizationRequiredError
  - JustificationRequiredError
  - Implement global error handler
  - Add error logging
  - _Requirements: NFR-12_

### Task 5.4: Implement Data Encryption
- [ ] 5.4 Add encryption for sensitive data
  - Implement encryption utilities
  - Encrypt cash amounts in storage
  - Encrypt audit log details
  - Use AES-256-GCM encryption
  - _Requirements: NFR-07_

---

## Phase 6: Integration with Sales System (3 tasks)

### Task 6.1: Implement Sales Integration
- [ ] 6.1 Create SalesIntegrationService
  - Auto-link sales to active cash session
  - Validate operator has open session before sale
  - Record transaction when sale is completed
  - Handle multiple payment methods
  - Calculate and record change given
  - _Requirements: 15.1, 15.2, 15.3, 15.4, BR-08_

### Task 6.2: Implement Sale Cancellation
- [ ] 6.2 Add cancellation support
  - Implement estorno (reversal) logic
  - Require supervisor authorization
  - Create negative transaction
  - Update session balance
  - Log cancellation in audit
  - _Requirements: 15.5_

### Task 6.3: Add Real-time Balance Updates
- [ ] 6.3 Implement WebSocket for real-time updates
  - Emit balance updates after each transaction
  - Notify connected clients of session changes
  - Update dashboard in real-time
  - _Requirements: 2.4, NFR-02_

---

## Phase 7: Notifications and Alerts (3 tasks)

### Task 7.1: Implement Notification Service
- [ ] 7.1 Create NotificationService class
  - Implement email notifications
  - Implement in-app notifications
  - Support multiple recipients
  - Queue notifications for reliability
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

### Task 7.2: Implement Alert Rules
- [ ] 7.2 Create AlertService class
  - Alert on high cash balance (suggest sangria)
  - Alert on long open sessions (> 12h)
  - Alert on high cash breaks (> 5%)
  - Alert on pending transfers (> 2h)
  - Alert on unclosed sessions
  - _Requirements: 16.1, 16.2, 16.3, 16.5, BR-05, BR-06_

### Task 7.3: Implement Scheduled Jobs
- [ ] 7.3 Create cron jobs for alerts
  - Check for long sessions every hour
  - Check for pending transfers every 30 minutes
  - Send daily summary to managers
  - Clean up old audit logs (> 5 years)
  - _Requirements: NFR-15, BR-05, BR-06_

---

## Phase 8: Reports and Analytics (3 tasks)

### Task 8.1: Implement Report Generation
- [ ] 8.1 Create ReportService class
  - Generate session report with all details
  - Generate daily consolidation report
  - Generate cash break analysis report
  - Generate operator performance report
  - Include charts and visualizations
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

### Task 8.2: Implement PDF Export
- [ ] 8.2 Add PDF generation
  - Use library like PDFKit or Puppeteer
  - Create professional report templates
  - Include establishment logo and branding
  - Add page numbers and timestamps
  - Support A4 and Letter sizes
  - _Requirements: 11.5, NFR-16_

### Task 8.3: Implement Excel Export
- [ ] 8.3 Add Excel generation
  - Use library like ExcelJS
  - Export transaction details
  - Export daily consolidation
  - Include formulas and formatting
  - Support filtering and sorting
  - _Requirements: 6.5, 11.5, NFR-17_

---

## Phase 9: Configuration and Admin (2 tasks)

### Task 9.1: Implement Configuration Service
- [ ] 9.1 Create ConfigurationService class
  - Store configuration in database
  - Implement get/set methods
  - Cache configuration values
  - Support per-establishment configuration
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

### Task 9.2: Implement Admin Configuration UI
- [ ] 9.2 Create configuration endpoints
  - GET /api/v1/cash/config
  - PUT /api/v1/cash/config
  - Validate configuration values
  - Require admin permission
  - Log configuration changes
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

---

## Phase 10: Performance and Optimization (3 tasks)

### Task 10.1: Implement Caching
- [ ] 10.1 Add Redis caching
  - Cache active sessions by operator
  - Cache session balances
  - Cache configuration values
  - Implement cache invalidation
  - Set appropriate TTLs
  - _Requirements: NFR-01, NFR-02, NFR-03_

### Task 10.2: Optimize Database Queries
- [ ] 10.2 Add query optimizations
  - Use raw SQL for complex aggregations
  - Add database indexes
  - Implement query result caching
  - Use batch operations where possible
  - Profile slow queries
  - _Requirements: NFR-01, NFR-03_

### Task 10.3: Implement Monitoring
- [ ] 10.3 Add monitoring and metrics
  - Track average session duration
  - Track cash break frequency
  - Track transaction volume
  - Track API response times
  - Set up alerts for anomalies
  - _Requirements: NFR-01, NFR-04_

---

## Phase 11: Testing (4 tasks)

### Task 11.1: Write Unit Tests for Services
- [ ]* 11.1 Create unit tests
  - Test CashSessionService methods
  - Test TransactionService methods
  - Test ClosingService methods
  - Test TreasuryService methods
  - Test validation logic
  - Test error handling
  - Achieve 80%+ code coverage
  - _Requirements: All functional requirements_

### Task 11.2: Write Integration Tests
- [ ]* 11.2 Create integration tests
  - Test complete session lifecycle
  - Test withdrawal and supply flows
  - Test closing and transfer flows
  - Test error scenarios
  - Test authorization checks
  - _Requirements: All functional requirements_

### Task 11.3: Write E2E Tests
- [ ]* 11.3 Create end-to-end tests
  - Test full user workflows
  - Test multi-user scenarios
  - Test concurrent operations
  - Test edge cases
  - _Requirements: All functional requirements_

### Task 11.4: Performance Testing
- [ ]* 11.4 Create performance tests
  - Load test with 50 concurrent sessions
  - Stress test transaction recording
  - Test database query performance
  - Test API response times
  - _Requirements: NFR-01, NFR-02, NFR-03_

---

## Phase 12: Documentation and Deployment (3 tasks)

### Task 12.1: Write API Documentation
- [ ] 12.1 Create comprehensive API docs
  - Document all endpoints with Swagger
  - Add request/response examples
  - Document error codes
  - Add authentication requirements
  - Include usage examples
  - _Requirements: All API endpoints_

### Task 12.2: Write User Documentation
- [ ] 12.2 Create user guides
  - Write operator manual
  - Write supervisor manual
  - Write treasurer manual
  - Create video tutorials
  - Add troubleshooting guide
  - _Requirements: NFR-11, NFR-12, NFR-13_

### Task 12.3: Prepare for Deployment
- [ ] 12.3 Setup deployment configuration
  - Configure environment variables
  - Setup database migrations
  - Configure backup strategy
  - Setup monitoring and alerts
  - Create deployment checklist
  - _Requirements: NFR-04, NFR-05, NFR-06, NFR-15_

---

## Summary

**Total Tasks:** 47 main tasks + 4 optional testing tasks
**Estimated Time:** 120-150 hours
**Priority:** High (Critical for financial operations)
**Dependencies:** Backend API Core (✅ Complete)

**Key Deliverables:**
- Complete cash management system
- Full audit trail and compliance
- Real-time balance tracking
- Comprehensive reporting
- Secure and performant
- Well-documented and tested
