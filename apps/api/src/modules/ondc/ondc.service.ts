import { BadRequestException, Injectable } from '@nestjs/common';
import { IntegrationDirection, IntegrationEventStatus, IntegrationProviderEnum, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { randomHex } from '../../common/utils/crypto.util';

const SUPPORTED_ACTIONS = ['search', 'on_search', 'select', 'on_select', 'init', 'on_init', 'confirm', 'on_confirm', 'status', 'on_status', 'support', 'on_support'];

@Injectable()
export class OndcService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Protocol-lite ONDC adapter. In production the full Beckn/ONDC flows run here;
   * the demo stores the action, echoes an ack and clearly marks non-certification.
   */
  async handleAction(input: { action: string; payload: Record<string, unknown>; actorRole?: string }): Promise<{ ack: boolean; ondcAction: string; mode: 'demo'; certified: boolean; apiId: string }> {
    const action = (input.action ?? '').toLowerCase();
    if (!SUPPORTED_ACTIONS.includes(action)) throw new BadRequestException('unsupported_ondc_action');

    const apiId = `ONDC-${action.toUpperCase()}-${randomHex(6)}`;
    const event = await this.prisma.integrationEvent.create({
      data: {
        provider: IntegrationProviderEnum.ONDC,
        direction: IntegrationDirection.OUTBOUND,
        eventType: `ondc.${action}`,
        payload: { ...input.payload, _demo: true } as Prisma.InputJsonValue,
        status: IntegrationEventStatus.QUEUED,
        idempotencyKey: apiId,
      },
    });
    await this.audit.record({ actorUserId: undefined, action: 'ondc:action', targetType: 'integration_event', targetId: event.id, after: { action, actor: input.actorRole } });
    return {
      ack: true,
      ondcAction: action,
      mode: 'demo',
      certified: false,
      apiId,
    };
  }

  async inbound(input: { action: string; payload: Record<string, unknown> }) {
    const event = await this.prisma.integrationEvent.create({
      data: {
        provider: IntegrationProviderEnum.ONDC,
        direction: IntegrationDirection.INBOUND,
        eventType: `ondc.${input.action}`,
        payload: { ...input.payload, _demo: true } as Prisma.InputJsonValue,
        status: IntegrationEventStatus.QUEUED,
      },
    });
    return { ack: true, eventId: event.id };
  }
}

export type { Prisma };