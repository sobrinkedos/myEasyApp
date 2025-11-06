# Requirements Document

## Introduction

Este documento define os requisitos para o sistema de gerenciamento de estabelecimentos (CRUD), incluindo a vinculação automática de usuários ao estabelecimento do administrador criador. O sistema permitirá que administradores criem e gerenciem estabelecimentos, e todos os usuários criados por esse administrador serão automaticamente vinculados ao mesmo estabelecimento.

## Glossary

- **System**: O sistema de gerenciamento de restaurantes
- **Establishment**: Entidade que representa um restaurante, bar ou lanchonete
- **Administrator**: Usuário com permissões para criar e gerenciar estabelecimentos
- **Creator**: Usuário administrador que criou o estabelecimento
- **User**: Qualquer usuário do sistema vinculado a um estabelecimento
- **CNPJ**: Cadastro Nacional de Pessoa Jurídica (identificador único brasileiro)
- **API**: Interface de programação de aplicações REST
- **JWT**: JSON Web Token usado para autenticação

## Requirements

### Requirement 1

**User Story:** Como administrador, eu quero criar um novo estabelecimento com todas as informações necessárias, para que eu possa começar a gerenciar meu negócio no sistema

#### Acceptance Criteria

1. WHEN the Administrator submits establishment creation data, THE System SHALL validate all required fields (name, CNPJ, address, phone, email)
2. WHEN the Administrator provides a CNPJ, THE System SHALL verify that the CNPJ is unique in the database
3. WHEN the establishment is created successfully, THE System SHALL automatically link the Creator to the new establishment
4. WHEN the establishment is created, THE System SHALL return the complete establishment data including the generated ID
5. IF the CNPJ already exists, THEN THE System SHALL return an error message indicating duplicate CNPJ

### Requirement 2

**User Story:** Como administrador, eu quero visualizar os detalhes do meu estabelecimento, para que eu possa verificar as informações cadastradas

#### Acceptance Criteria

1. WHEN the Administrator requests establishment details, THE System SHALL return all establishment information including name, CNPJ, address, phone, email, logo, and tax settings
2. WHEN the Administrator requests establishment details, THE System SHALL verify that the user belongs to the requested establishment
3. IF the Administrator does not belong to the establishment, THEN THE System SHALL return an authorization error
4. THE System SHALL format the address as a structured JSON object with street, number, complement, neighborhood, city, state, and postal code

### Requirement 3

**User Story:** Como administrador, eu quero atualizar as informações do meu estabelecimento, para que eu possa manter os dados sempre atualizados

#### Acceptance Criteria

1. WHEN the Administrator submits updated establishment data, THE System SHALL validate all provided fields
2. WHEN the Administrator updates the CNPJ, THE System SHALL verify that the new CNPJ is unique
3. WHEN the establishment is updated successfully, THE System SHALL return the updated establishment data
4. THE System SHALL allow partial updates without requiring all fields
5. THE System SHALL update the updatedAt timestamp automatically

### Requirement 4

**User Story:** Como administrador, eu quero fazer upload de um logotipo para o meu estabelecimento, para que eu possa personalizar a identidade visual

#### Acceptance Criteria

1. WHEN the Administrator uploads a logo file, THE System SHALL validate that the file is an image (PNG, JPG, JPEG)
2. WHEN the logo file is valid, THE System SHALL store the file in the uploads directory
3. WHEN the logo is uploaded successfully, THE System SHALL update the establishment logoUrl field
4. THE System SHALL limit the logo file size to 5MB maximum
5. IF an old logo exists, THEN THE System SHALL delete the old logo file before saving the new one

### Requirement 5

**User Story:** Como administrador, eu quero excluir meu estabelecimento, para que eu possa remover completamente meus dados do sistema quando necessário

#### Acceptance Criteria

1. WHEN the Administrator requests establishment deletion, THE System SHALL verify that the user is the establishment owner
2. WHEN the establishment is deleted, THE System SHALL cascade delete all related users
3. WHEN the establishment is deleted, THE System SHALL cascade delete all related roles
4. WHEN the establishment is deleted, THE System SHALL cascade delete all related cash registers
5. THE System SHALL return a confirmation message after successful deletion

### Requirement 6

**User Story:** Como administrador, eu quero que todos os usuários que eu criar sejam automaticamente vinculados ao meu estabelecimento, para que eu não precise configurar isso manualmente

#### Acceptance Criteria

1. WHEN the Administrator creates a new user, THE System SHALL automatically set the establishmentId to the Administrator's establishmentId
2. THE System SHALL prevent users from being created without an establishmentId
3. THE System SHALL validate that the establishmentId exists before creating a user
4. WHEN a user is created, THE System SHALL enforce the unique constraint on email within the same establishment
5. THE System SHALL allow the same email to exist in different establishments

### Requirement 7

**User Story:** Como administrador, eu quero configurar as definições fiscais do meu estabelecimento, para que o sistema calcule impostos corretamente

#### Acceptance Criteria

1. WHEN the Administrator provides tax settings, THE System SHALL store them as a JSON object
2. THE System SHALL validate that tax settings contain required fields (taxRegime, serviceChargePercentage)
3. WHEN tax settings are updated, THE System SHALL preserve existing settings not included in the update
4. THE System SHALL allow tax settings to include custom fields for different tax regimes
5. THE System SHALL return validation errors if tax percentages are negative or exceed 100

### Requirement 8

**User Story:** Como desenvolvedor, eu quero que o sistema registre todas as operações de estabelecimento em logs de auditoria, para que possamos rastrear mudanças e garantir conformidade

#### Acceptance Criteria

1. WHEN an establishment is created, THE System SHALL create an audit log entry with action "CREATE"
2. WHEN an establishment is updated, THE System SHALL create an audit log entry with previous and new states
3. WHEN an establishment is deleted, THE System SHALL create an audit log entry with action "DELETE"
4. THE System SHALL include user ID, IP address, and timestamp in all audit logs
5. THE System SHALL store the complete establishment state in audit logs for compliance

### Requirement 9

**User Story:** Como administrador, eu quero listar todos os estabelecimentos que tenho acesso, para que eu possa gerenciar múltiplos negócios se necessário

#### Acceptance Criteria

1. WHEN the Administrator requests the establishment list, THE System SHALL return only establishments the user has access to
2. THE System SHALL support pagination with configurable page size
3. THE System SHALL support filtering by name and CNPJ
4. THE System SHALL support sorting by name, createdAt, and updatedAt
5. THE System SHALL return the total count of establishments along with the paginated results

### Requirement 10

**User Story:** Como sistema, eu quero validar o formato do CNPJ, para que apenas CNPJs válidos sejam aceitos

#### Acceptance Criteria

1. WHEN a CNPJ is provided, THE System SHALL validate that it contains exactly 14 digits
2. THE System SHALL validate the CNPJ check digits using the official algorithm
3. THE System SHALL accept CNPJ with or without formatting (dots, slashes, hyphens)
4. THE System SHALL normalize the CNPJ to digits only before storage
5. IF the CNPJ format is invalid, THEN THE System SHALL return a validation error message
