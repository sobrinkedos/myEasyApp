export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors: Record<string, string[]>) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Autenticação necessária') {
    super(401, message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} não encontrado`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(422, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso proibido') {
    super(403, message);
  }
}

// Establishment-specific errors
export class EstablishmentNotFoundError extends NotFoundError {
  constructor() {
    super('Estabelecimento');
  }
}

export class DuplicateCNPJError extends ConflictError {
  constructor() {
    super('CNPJ já cadastrado no sistema');
  }
}

export class InvalidCNPJError extends ValidationError {
  constructor() {
    super('CNPJ inválido', { 
      cnpj: ['Formato ou dígitos verificadores inválidos'] 
    });
  }
}

export class UnauthorizedEstablishmentAccessError extends ForbiddenError {
  constructor() {
    super('Você não tem permissão para acessar este estabelecimento');
  }
}

// Cash Management specific errors
export class SessionAlreadyOpenError extends ConflictError {
  constructor() {
    super('Operador já possui um caixa aberto');
  }
}

export class SessionNotFoundError extends NotFoundError {
  constructor(sessionId?: string) {
    super(sessionId ? `Sessão de caixa ${sessionId}` : 'Sessão de caixa');
  }
}

export class InvalidSessionStatusError extends BusinessRuleError {
  constructor(currentStatus: string, requiredStatus: string) {
    super(`Status da sessão é ${currentStatus}, requerido ${requiredStatus}`);
  }
}

export class InsufficientCashError extends BusinessRuleError {
  constructor(available: number, required: number) {
    super(`Saldo insuficiente. Disponível: R$ ${available.toFixed(2)}, Necessário: R$ ${required.toFixed(2)}`);
  }
}

export class AuthorizationRequiredError extends AuthorizationError {
  constructor(operation: string) {
    super(`Autorização necessária para ${operation}`);
  }
}

export class JustificationRequiredError extends ValidationError {
  constructor(reason: string) {
    super(reason, { justification: [reason] });
  }
}

export class BusinessError extends BusinessRuleError {
  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}
