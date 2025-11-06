# Implementation Plan - Establishment Management

- [-] 1. Set up core infrastructure and utilities

  - Create CNPJ validation utility with official algorithm
  - Create file upload configuration with Multer
  - Create custom error classes for establishment operations
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 4.1, 4.2, 4.4_

- [ ] 2. Implement data access layer (Repository)
  - [ ] 2.1 Create EstablishmentRepository class with Prisma integration
    - Implement create method for new establishments
    - Implement findById method with proper error handling
    - Implement findByCNPJ method for duplicate checking
    - Implement findByUserId method to get user's establishment
    - Implement update method with partial updates support
    - Implement delete method with cascade handling
    - Implement findMany method with pagination and filtering
    - Implement existsByCNPJ method for validation
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 5.1, 9.1, 9.2, 9.3_

- [ ] 3. Implement business logic layer (Service)
  - [ ] 3.1 Create EstablishmentService class with business rules
    - Implement create method with CNPJ validation and user linking
    - Implement getById method with authorization checks
    - Implement getByUserId method for current user's establishment
    - Implement update method with validation and audit logging
    - Implement delete method with cascade and audit logging
    - Implement list method with pagination and filtering
    - Implement private validateCNPJ method using utility
    - Implement private normalizeCNPJ method
    - Implement private createAuditLog method
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 5.1, 5.2, 5.3, 8.1, 8.2, 8.3, 9.1_
  
  - [ ] 3.2 Implement logo upload functionality
    - Create uploadLogo method in service
    - Handle old logo deletion before new upload
    - Update establishment logoUrl field
    - Create audit log for logo changes
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 8.2_
  
  - [ ] 3.3 Implement tax settings management
    - Validate tax settings structure in create/update methods
    - Ensure required fields (taxRegime, serviceChargePercentage)
    - Validate percentage ranges (0-100)
    - Preserve existing settings on partial updates
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 4. Implement API layer (Controller and Routes)
  - [ ] 4.1 Create Zod validation schemas
    - Create createEstablishmentSchema with all required fields
    - Create updateEstablishmentSchema as partial
    - Create listQuerySchema with pagination parameters
    - Add CNPJ format validation in schemas
    - Add address structure validation
    - _Requirements: 1.1, 3.1, 9.2, 9.3, 9.4, 10.1, 10.3_
  
  - [ ] 4.2 Create EstablishmentController class
    - Implement create method with validation and response formatting
    - Implement getById method with authorization
    - Implement getMyEstablishment method for current user
    - Implement update method with validation
    - Implement uploadLogo method with file handling
    - Implement delete method with confirmation
    - Implement list method with query parameters
    - Add consistent error handling in all methods
    - _Requirements: 1.1, 1.4, 2.1, 2.3, 3.1, 3.3, 4.3, 5.1, 5.5, 9.1, 9.5_
  
  - [ ] 4.3 Create establishment routes configuration
    - Define POST /api/v1/establishment for creation
    - Define GET /api/v1/establishment/me for current user
    - Define GET /api/v1/establishment/:id for specific establishment
    - Define PUT /api/v1/establishment/:id for updates
    - Define POST /api/v1/establishment/:id/logo for logo upload
    - Define DELETE /api/v1/establishment/:id for deletion
    - Define GET /api/v1/establishment for listing
    - Add authentication middleware to all routes
    - Add authorization middleware with proper permissions
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 9.1_

- [ ] 5. Integrate with user creation flow
  - [ ] 5.1 Update user creation to auto-link establishment
    - Modify user service to extract establishmentId from JWT
    - Add validation to ensure establishmentId exists
    - Enforce unique email per establishment constraint
    - Update user creation endpoint to use authenticated user's establishment
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 6. Implement audit logging integration
  - [ ] 6.1 Create audit log entries for all operations
    - Log establishment creation with full data
    - Log establishment updates with previous and new states
    - Log establishment deletion with final state
    - Include user ID, IP address, and timestamp in all logs
    - Store complete establishment state for compliance
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 7. Add file upload directory setup
  - Create uploads/logos directory structure
  - Add .gitkeep file to maintain directory in git
  - Update .gitignore to exclude uploaded files
  - Add directory creation in application startup
  - _Requirements: 4.2, 4.3_

- [ ] 8. Register routes in main application
  - Import establishment routes in app.ts
  - Mount routes at /api/v1/establishment
  - Ensure proper middleware order (auth before routes)
  - Test route registration with API documentation
  - _Requirements: All_

- [ ]* 9. Write comprehensive tests
  - [ ]* 9.1 Write unit tests for CNPJ validation utility
    - Test valid CNPJ formats
    - Test invalid CNPJ formats
    - Test check digit validation
    - Test normalization function
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 9.2 Write unit tests for EstablishmentService
    - Test create method with valid data
    - Test create method with duplicate CNPJ
    - Test create method with invalid CNPJ
    - Test update method with partial data
    - Test delete method with cascade
    - Test authorization checks in all methods
    - Test audit log creation
    - _Requirements: 1.1, 1.2, 1.5, 3.1, 3.2, 5.1, 5.2, 5.3, 8.1, 8.2, 8.3_
  
  - [ ]* 9.3 Write integration tests for API endpoints
    - Test POST /api/v1/establishment with valid data
    - Test POST /api/v1/establishment with duplicate CNPJ
    - Test GET /api/v1/establishment/me
    - Test GET /api/v1/establishment/:id with authorization
    - Test PUT /api/v1/establishment/:id
    - Test POST /api/v1/establishment/:id/logo with file upload
    - Test DELETE /api/v1/establishment/:id
    - Test GET /api/v1/establishment with pagination
    - Test unauthorized access attempts
    - _Requirements: All_

- [ ]* 10. Create API documentation
  - Document all endpoints with Swagger/OpenAPI
  - Include request/response examples
  - Document error responses
  - Add authentication requirements
  - Document file upload specifications
  - _Requirements: All_
