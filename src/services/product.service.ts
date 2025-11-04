import {
  ProductRepository,
  CreateProductDTO,
  UpdateProductDTO,
  PaginationParams,
  PaginatedResponse,
} from '@/repositories/product.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { Product } from '@prisma/client';
import prisma from '@/config/database';
import { cacheService } from '@/utils/cache';

export class ProductService {
  private repository: ProductRepository;
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_PREFIX = 'products';

  constructor() {
    this.repository = new ProductRepository();
  }

  async getAll(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    // Generate cache key
    const cacheKey = `${this.CACHE_PREFIX}:list:${JSON.stringify(params)}`;

    // Try to get from cache
    const cached = await cacheService.get<PaginatedResponse<Product>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const result = await this.repository.findMany(params);

    // Cache result
    await cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async getById(id: string): Promise<Product> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new NotFoundError('Produto');
    }

    return product;
  }

  async create(data: CreateProductDTO): Promise<Product> {
    // Validate price
    if (data.price < 0) {
      throw new ValidationError('Preço deve ser maior ou igual a zero', {
        price: ['Preço deve ser maior ou igual a zero'],
      });
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundError('Categoria');
    }

    const product = await this.repository.create(data);

    // Invalidate cache
    await cacheService.delPattern(`${this.CACHE_PREFIX}:*`);

    return product;
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    // Check if product exists
    await this.getById(id);

    // Validate price if provided
    if (data.price !== undefined && data.price < 0) {
      throw new ValidationError('Preço deve ser maior ou igual a zero', {
        price: ['Preço deve ser maior ou igual a zero'],
      });
    }

    // Validate category if provided
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundError('Categoria');
      }
    }

    const product = await this.repository.update(id, data);

    // Invalidate cache
    await cacheService.delPattern(`${this.CACHE_PREFIX}:*`);

    return product;
  }

  async delete(id: string): Promise<void> {
    // Check if product exists
    await this.getById(id);

    await this.repository.delete(id);

    // Invalidate cache
    await cacheService.delPattern(`${this.CACHE_PREFIX}:*`);
  }
}
