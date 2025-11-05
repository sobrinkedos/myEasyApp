import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '@/config/jwt';
import prisma from '@/config/database';
import { AuthenticationError } from '@/utils/errors';

export interface LoginCredentials {
  email: string;
  password: string;
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

  async hashPassword(password: string): Promise<string> {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    return bcrypt.hash(password, rounds);
  }
}
