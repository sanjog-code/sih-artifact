import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CatalogueService } from './catalogue.service';
import { Public, Permissions, RateLimit } from '../../common/decorators/auth.decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { PERMISSIONS } from '@farmlink/shared';
import { SearchRateLimit } from '../../common/guards/rate-limit.guard';

const idParam = z.string().min(1);

@ApiTags('catalogue')
@Controller('catalogue')
@UseGuards(AuthGuard, RbacGuard)
export class CatalogueController {
  constructor(private readonly catalogue: CatalogueService) {}

  @Public()
  @Get('crops')
  @RateLimit(SearchRateLimit)
  async crops() {
    return this.catalogue.listCrops();
  }

  @Public()
  @Get('crops/:id')
  async crop(@Param('id') id: string) {
    return this.catalogue.getCrop(idParam.parse(id));
  }

  @Public()
  @Get('warehouses')
  async warehouses() {
    return this.catalogue.listWarehouses();
  }

  @Get('price-rules')
  @Permissions(PERMISSIONS.CATALOGUE_READ)
  async priceRules() {
    return this.catalogue.listPriceRules();
  }

  @Put('price-rules')
  @Permissions(PERMISSIONS.ADMIN_CATALOGUE)
  async upsertPriceRule(@Body() _body: unknown) {
    return { ok: true };
  }
}