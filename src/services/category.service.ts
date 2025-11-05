import { CategoryRepository, CreateCategoryDTO, UpdateCategoryDTO } from '@/repositories/category.repository';
import { ConflictError, NotFoundError } from '@/utils/errors';
import { Category } from '@prisma/client';
import { cacheService } from '@/utils/cache';

export class CategoryService {
  private repository: CategoryRepository;
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_PREFIX = 'categories';

  constructor() {
    this.repository = new CategoryRepository();
  }

  async getAll(): Promise<Category[]> {
    // Try to get from cache
    const cacheKey = `${this.CACHE_PREFIX}:list`;
    const cached = await cacheService.get<Category[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const categories = await this.repository.findAll();

    // Cache result
    await cacheService.set(cacheKey, categories, this.CACHE_TTL);

    return categories;
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

    const category = await this.repository.create(data);

    // Invalidate cache
    await cacheService.delPattern(`${this.CACHE_PREFIX}:*`);

    return category;
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

    const category = await this.repository.update(id, data);

    // Invalidate cache
    await cacheService.delPattern(`${this.CACHE_PREFIX}:*`);

    return category;
  }

  async delete(id: string): Promise<void> {
    // Check if category exists
    await this.getById(id);

    await this.repository.delete(id);

    // Invalidate cache
    await cacheService.delPattern(`${this.CACHE_PREFIX}:*`);
  }
}
