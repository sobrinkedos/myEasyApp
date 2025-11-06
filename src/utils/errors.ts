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
