import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '@/config/jwt';
import prisma from '@/config/database';
import { AuthenticationError, ConflictError, ValidationError } from '@/utils/errors';
import { validateCNPJ } from '@/utils/cnpj';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  establishment: {
    name: string;
    cnpj: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    email: string;
    taxSettings: {
      taxRegime: 'simples' | 'presumido' | 'real';
      icmsRate: number;
      issRate: number;
      pisRate: number;
      cofinsRate: number;
    };
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  establishmentId: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    name: string;
    establishmentId: string;
    roles: string[];
    permissions: string[];
  };
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { email, password } = credentials;

    // Find user by email with roles and permissions
    const user = await prisma.user.findFirst({
      where: { 
        email,
        isActive: true 
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new AuthenticationError('Credenciais inválidas');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Credenciais inválidas');
    }

    // Extract roles and permissions
    const roles = user.roles.map(ur => ur.role.name);
    const permissions = user.roles.flatMap(ur => 
      ur.role.permissions.map(rp => `${rp.permission.resource}:${rp.permission.action}`)
    );

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      establishmentId: user.establishmentId,
      roles,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    return {
      token,
      expiresIn: jwtConfig.expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        establishmentId: user.establishmentId,
        roles,
        permissions,
      },
    };
  }

  async validateToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new AuthenticationError('Token inválido ou expirado');
    }
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    // Normalize and validate CNPJ
    const cnpjDigits = data.establishment.cnpj.replace(/\D/g, '');
    
    if (!validateCNPJ(cnpjDigits)) {
      throw new ValidationError('CNPJ inválido', {
        'establishment.cnpj': ['CNPJ inválido'],
      });
    }

    // Check if CNPJ already exists
    const existingEstablishment = await prisma.establishment.findUnique({
      where: { cnpj: cnpjDigits },
    });

    if (existingEstablishment) {
      throw new ConflictError('CNPJ já cadastrado');
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email já cadastrado');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create establishment and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create establishment
      const establishment = await tx.establishment.create({
        data: {
          name: data.establishment.name,
          cnpj: cnpjDigits,
          address: data.establishment.address,
          phone: data.establishment.phone,
          email: data.establishment.email,
          taxSettings: data.establishment.taxSettings,
        },
      });

      // Get or create admin role
      let adminRole = await tx.role.findFirst({
        where: {
          name: 'admin',
          establishmentId: establishment.id,
        },
      });

      if (!adminRole) {
        adminRole = await tx.role.create({
          data: {
            name: 'admin',
            description: 'Administrador do estabelecimento',
            establishmentId: establishment.id,
            isSystem: true,
          },
        });
      }

      // Create user
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          establishmentId: establishment.id,
          isActive: true,
          emailVerified: false,
        },
      });

      // Assign admin role to user
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'register',
          resource: 'user',
          resourceId: user.id,
          newState: {
            user: { id: user.id, email: user.email, name: user.name },
            establishment: { id: establishment.id, name: establishment.name },
          },
          ipAddress: 'system',
        },
      });

      return { user, establishment, adminRole };
    });

    // Generate JWT token and return login response
    const payload: JWTPayload = {
      userId: result.user.id,
      email: result.user.email,
      establishmentId: result.establishment.id,
      roles: ['admin'],
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    return {
      token,
      expiresIn: jwtConfig.expiresIn,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        establishmentId: result.establishment.id,
        roles: ['admin'],
        permissions: [], // Admin has all permissions
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    return bcrypt.hash(password, rounds);
  }
}
