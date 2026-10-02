import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/redis/cache.service';

@Injectable()
export class CatalogueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async listCrops(includeInactive = false) {
    const key = `catalogue:crops:${includeInactive}`;
    const cached = await this.cache.get(key);
    if (cached) return cached;
    const crops = await this.prisma.crop.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        varieties: { where: { isActive: true }, orderBy: { name: 'asc' } },
      },
    });
    void this.cache.set(key, crops, 300);
    return crops;
  }

  async getCrop(cropId: string) {
    return this.prisma.crop.findUnique({
      where: { id: cropId },
      include: { varieties: { orderBy: { name: 'asc' } }, priceRules: true },
    });
  }

  async listPriceRules() {
    return this.prisma.priceRule.findMany({ include: { crop: true }, orderBy: [{ cropId: 'asc' }, { grade: 'asc' }] });
  }

  async listStorageLocations(warehouseId: string) {
    return this.prisma.storageLocation.findMany({ where: { warehouseId, isActive: true }, orderBy: { code: 'asc' } });
  }

  async listWarehouses(active = true) {
    return this.prisma.warehouse.findMany({
      where: active ? { isActive: true } : {},
      orderBy: { name: 'asc' },
      include: { storage: true },
    });
  }
}