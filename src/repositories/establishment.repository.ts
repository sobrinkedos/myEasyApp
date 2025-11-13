import prisma from '@/config/database';
import { Establishment } from '@prisma/client';
import type { CreateEstablishmentDTO, UpdateEstablishmentDTO } from '@/models/establishment.model';

export class EstablishmentRepository {
  async findAll(): Promise<Establishment[]> {
    return prisma.establishment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFirst(): Promise<Establishment | null> {
    return prisma.establishment.findFirst();
  }

  async findById(id: string): Promise<Establishment | null> {
    return prisma.establishment.findUnique({
      where: { id },
    });
  }

  async findByCnpj(cnpj: string): Promise<Establishment | null> {
    return prisma.establishment.findUnique({
      where: { cnpj },
    });
  }

  async create(data: CreateEstablishmentDTO): Promise<Establishment> {
    return prisma.establishment.create({
      data,
    });
  }

  async update(id: string, data: UpdateEstablishmentDTO): Promise<Establishment> {
    return prisma.establishment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Establishment> {
    return prisma.establishment.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return prisma.establishment.count();
  }
}

export const establishmentRepository = new EstablishmentRepository();
