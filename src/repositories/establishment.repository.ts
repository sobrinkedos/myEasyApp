import prisma from '@/config/database';
import { Establishment } from '@prisma/client';

export interface CreateEstablishmentDTO {
  name: string;
  cnpj: string;
  address: any;
  phone: string;
  email: string;
  logoUrl?: string;
  taxSettings: any;
}

export interface UpdateEstablishmentDTO {
  name?: string;
  cnpj?: string;
  address?: any;
  phone?: string;
  email?: string;
  logoUrl?: string;
  taxSettings?: any;
}

export class EstablishmentRepository {
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
}
