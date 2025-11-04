import { CategoryRepository, CreateCategoryDTO, UpdateCategoryDTO } from '@/repositories/category.repository';
import { ConflictError, NotFoundError } from '@/utils/errors';
import { Category } from '@prisma/client';

export class CategoryService {
  private repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  async getAll(): Promise<Category[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Category> {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new NotFoundError('Categoria');
    }

    return category;
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    // Check if category with same name already exists
    const existing = await this.repository.findByName(data.name);

    if (existing) {
      throw new ConflictError('Categoria já existe');
    }

    return this.repository.create(data);
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    // Check if category exists
    await this.getById(id);

    // If updating name, check if new name is already taken
    if (data.name) {
      const existing = await this.repository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError('Já existe uma categoria com este nome');
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    // Check if category exists
    await this.getById(id);

    await this.repository.delete(id);
  }
}
