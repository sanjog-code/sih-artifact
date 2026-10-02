import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IvrService } from './ivr.service';
import { Public, RateLimit } from '../../common/decorators/auth.decorators';
import { OtpRateLimit } from '../../common/guards/rate-limit.guard';
import { ivrSessionStartSchema, ivrIntentSchema, ivrConfirmSchema } from '@farmlink/shared';

@ApiTags('ivr')
@Controller('ivr')
export class IvrController {
  constructor(private readonly ivr: IvrService) {}

  @Public()
  @Post('start')
  @RateLimit(OtpRateLimit)
  async start(@Body() body: unknown) {
    const parsed = ivrSessionStartSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.ivr.start(parsed.data);
  }

  @Public()
  @Post('menu')
  @RateLimit(OtpRateLimit)
  async menu(@Body() body: unknown) {
    const parsed = ivrIntentSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.ivr.handleMenu(parsed.data);
  }

  @Public()
  @Post('confirm')
  @RateLimit(OtpRateLimit)
  async confirm(@Body() body: unknown) {
    const parsed = ivrConfirmSchema.safeParse(body ?? {});
    if (!parsed.success) return { ok: false, code: 'validation_error', issues: parsed.error.issues };
    return this.ivr.confirm(parsed.data);
  }
}