import prisma from '@/config/database';
import { Category } from '@prisma/client';

export interface CreateCategoryDTO {
  name: string;
  displayOrder: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
