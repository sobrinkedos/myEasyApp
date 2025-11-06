import { EstablishmentRepository } from '@/repositories/establishment.repository';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { Establishment } from '@prisma/client';
import prisma from '@/config/database';
import { validateCNPJ } from '@/utils/cnpj';
import type { CreateEstablishmentDTO, UpdateEstablishmentDTO } from '@/models/establishment.model';

export class EstablishmentService {
  private repository: EstablishmentRepository;

  constructor() {
    this.repository = new EstablishmentRepository();
  }

  async getAll(): Promise<Establishment[]> {
    return this.repository.findAll();
  }

  async get(): Promise<Establishment> {
    const establishment = await this.repository.findFirst();

    if (!establishment) {
      throw new NotFoundError('Estabelecimento');
    }

    return establishment;
  }

  async getById(id: string): Promise<Establishment> {
    const establishment = await this.repository.findById(id);

    if (!establishment) {
      throw new NotFoundError('Estabelecimento');
    }

    return establishment;
  }

  async create(data: CreateEstablishmentDTO, userId?: string): Promise<Establishment> {
    // Normalize CNPJ (remove formatting)
    const cnpjDigits = data.cnpj.replace(/\D/g, '');

    // Validate CNPJ
    if (!validateCNPJ(cnpjDigits)) {
      throw new ConflictError('CNPJ inválido');
    }

    // Check if CNPJ already exists
    const existing = await this.repository.findByCnpj(cnpjDigits);
    if (existing) {
      throw new ConflictError('CNPJ já cadastrado');
    }

    const establishment = await this.repository.create({
      ...data,
      cnpj: cnpjDigits,
    });

    // Create audit log if userId provided
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'create',
          resource: 'establishment',
          resourceId: establishment.id,
          newState: establishment,
          ipAddress: 'system',
        },
      });
    }

    return establishment;
  }

  async update(id: string, data: UpdateEstablishmentDTO, userId: string): Promise<Establishment> {
    const establishment = await this.getById(id);

    // Validate and normalize CNPJ if provided
    if (data.cnpj) {
      const cnpjDigits = data.cnpj.replace(/\D/g, '');

      if (!validateCNPJ(cnpjDigits)) {
        throw new ConflictError('CNPJ inválido');
      }

      // Check if new CNPJ is already taken
      const existing = await this.repository.findByCnpj(cnpjDigits);
      if (existing && existing.id !== id) {
        throw new ConflictError('CNPJ já cadastrado');
      }

      data.cnpj = cnpjDigits;
    }

    const updated = await this.repository.update(id, data);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'update',
        resource: 'establishment',
        resourceId: id,
        previousState: establishment,
        newState: updated,
        ipAddress: 'system',
      },
    });

    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const establishment = await this.getById(id);

    // Check if establishment has users
    const userCount = await prisma.user.count({
      where: { establishmentId: id },
    });

    if (userCount > 0) {
      throw new ConflictError(
        `Não é possível excluir o estabelecimento. Existem ${userCount} usuário(s) vinculado(s).`
      );
    }

    await this.repository.delete(id);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'delete',
        resource: 'establishment',
        resourceId: id,
        previousState: establishment,
        ipAddress: 'system',
      },
    });
  }
}
