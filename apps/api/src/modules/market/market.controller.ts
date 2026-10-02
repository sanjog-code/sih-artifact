import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { MarketService } from './market.service';
import { Public, RateLimit } from '../../common/decorators/auth.decorators';
import { SearchRateLimit } from '../../common/guards/rate-limit.guard';

const searchQ = z.object({
  q: z.string().optional(),
  cropId: z.string().optional(),
  grade: z.enum(['A1', 'A2', 'B', 'C']).optional(),
  state: z.string().length(2).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

@ApiTags('market')
@Controller('market')
export class MarketController {
  constructor(private readonly market: MarketService) {}

  @Public()
  @Get('search')
  @RateLimit(SearchRateLimit)
  async search(@Query() q: unknown) {
    const parsed = searchQ.safeParse(q ?? {});
    return this.market.search(parsed.success ? parsed.data : ({ page: 1, pageSize: 20 } as never));
  }

  @Public()
  @Get('catalogue')
  @RateLimit(SearchRateLimit)
  async catalogue() {
    return this.market.catalogue();
  }

  @Public()
  @Get('prices')
  @RateLimit(SearchRateLimit)
  async prices(@Query('cropId') cropId?: string) {
    return this.market.currentPrice(cropId);
  }

  @Public()
  @Get('trace/:lotId')
  @RateLimit(SearchRateLimit)
  async trace(@Param('lotId') lotId: string, @Query('qr') qrToken?: string) {
    return this.market.traceability(lotId, qrToken);
  }
}