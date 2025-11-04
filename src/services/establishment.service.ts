import {
  EstablishmentRepository,
  CreateEstablishmentDTO,
  UpdateEstablishmentDTO,
} from '@/repositories/establishment.repository';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { Establishment } from '@prisma/client';
import prisma from '@/config/database';

export class EstablishmentService {
  private repository: EstablishmentRepository;

  constructor() {
    this.repository = new EstablishmentRepository();
  }

  async get(): Promise<Establishment> {
    const establishment = await this.repository.findFirst();

    if (!establishment) {
      throw new NotFoundError('Estabelecimento');
    }

    return establishment;
  }

  async create(data: CreateEstablishmentDTO): Promise<Establishment> {
    // Validate CNPJ format (14 digits)
    const cnpjDigits = data.cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      throw new ValidationError('CNPJ inválido', {
        cnpj: ['CNPJ deve ter 14 dígitos'],
      });
    }

    // Check if CNPJ already exists
    const existing = await this.repository.findByCnpj(data.cnpj);
    if (existing) {
      throw new ConflictError('CNPJ já cadastrado');
    }

    return this.repository.create(data);
  }

  async update(data: UpdateEstablishmentDTO, userId: string): Promise<Establishment> {
    const establishment = await this.get();

    // Validate CNPJ if provided
    if (data.cnpj) {
      const cnpjDigits = data.cnpj.replace(/\D/g, '');
      if (cnpjDigits.length !== 14) {
        throw new ValidationError('CNPJ inválido', {
          cnpj: ['CNPJ deve ter 14 dígitos'],
        });
      }

      // Check if new CNPJ is already taken
      const existing = await this.repository.findByCnpj(data.cnpj);
      if (existing && existing.id !== establishment.id) {
        throw new ConflictError('CNPJ já cadastrado');
      }
    }

    const updated = await this.repository.update(establishment.id, data);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'update',
        entity: 'establishment',
        entityId: establishment.id,
        changes: data,
      },
    });

    return updated;
  }
}
