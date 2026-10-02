import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { t } from '@farmlink/shared';

type Lang = 'en' | 'hi';

@Injectable()
export class IvrService {
  constructor(private readonly prisma: PrismaService) {}

  private voice(lang: Lang, key: string, vars?: Record<string, string | number>): string {
    return t(lang, key as never, vars ?? {});
  }

  private async promptFor(session: { phone: string; lang?: string }, _fallback: string): Promise<{ sessionId: string; audio: string[]; options: Record<string, string>; lang: Lang }> {
    const lang: Lang = session.lang === 'hi' ? 'hi' : 'en';
    const audio = [this.voice(lang, 'ivr.welcome')];
    const options: Record<string, string> = {
      '1': this.voice(lang, 'ivr.opt.stock'),
      '2': this.voice(lang, 'ivr.opt.price'),
      '3': this.voice(lang, 'ivr.opt.pickup'),
      '4': this.voice(lang, 'ivr.opt.finance'),
      '9': this.voice(lang, 'ivr.opt.human'),
    };
    audio.push(this.voice(lang, 'ivr.menu'));
    return { sessionId: Math.random().toString(36).slice(2, 12), audio, options, lang };
  }

  async start(input: { phone: string; callSid: string; lang?: string }) {
    const user = await this.prisma.user.findUnique({ where: { phone: input.phone }, select: { id: true, name: true, role: true } });
    if (!user) throw new NotFoundException('unregistered_phone');
    const session = await this.prisma.ivrSession.create({
      data: { callSid: input.callSid, phone: input.phone, status: 'ACTIVE', intent: 'menu', state: { lang: input.lang ?? 'en' } },
    });
    const res = await this.promptFor({ phone: input.phone, lang: input.lang }, 'ivr.welcome');
    return { ...res, sessionId: session.id, user: { name: user.name, role: user.role } };
  }

  async handleMenu(input: { sessionId: string; phrase: string }) {
    const session = await this.prisma.ivrSession.findUnique({ where: { id: input.sessionId } });
    if (!session || session.status !== 'ACTIVE') throw new BadRequestException('session_not_active');
    const lang: Lang = ((session.state as { lang?: string } | null)?.lang ?? 'en') === 'hi' ? 'hi' : 'en';

    // Mock "spoken intent" resolution for demo: numeric digit from the phrase,
    // or menu keyword mapping. Maps choice -> live data.
    const digit = matchedDigit(input.phrase);
    switch (digit) {
      case '1': {
        const lots = await this.prisma.lot.count({ where: { farmer: { phone: session.phone } } });
        await this.prisma.ivrSession.update({ where: { id: session.id }, data: { intent: 'stock' } });
        return { audio: [this.voice(lang, 'ivr.reply.stock', { lots })], state: 'stock' };
      }
      case '2': {
        const farmer = await this.prisma.user.findUnique({ where: { phone: session.phone } });
        const latest = farmer ? await this.prisma.pricingInsight.findFirst({ where: { farmerId: farmer.id }, orderBy: { createdAt: 'desc' } }) : null;
        await this.prisma.ivrSession.update({ where: { id: session.id }, data: { intent: 'price' } });
        if (!latest) return { audio: [this.voice(lang, 'ivr.reply.no_price')], state: 'price' };
        return { audio: [this.voice(lang, 'ivr.reply.price', { low: Math.round(latest.suggestedLowRs), high: Math.round(latest.suggestedHighRs) })], state: 'price', disclaimer: latest.disclaimer };
      }
      case '3': {
        const pickups = await this.prisma.pickupRequest.count({ where: { farmer: { phone: session.phone }, status: { in: ['SUBMITTED', 'ACCEPTED', 'PICKUP_SCHEDULED'] } } });
        await this.prisma.ivrSession.update({ where: { id: session.id }, data: { intent: 'pickup' } });
        return { audio: [this.voice(lang, 'ivr.reply.pickup', { count: pickups })], state: 'pickup' };
      }
      case '4': {
        const farmer = await this.prisma.user.findUnique({ where: { phone: session.phone } });
        const cases = farmer ? await this.prisma.financeCase.count({ where: { farmerUserId: farmer.id } }) : 0;
        await this.prisma.ivrSession.update({ where: { id: session.id }, data: { intent: 'finance' } });
        return { audio: [this.voice(lang, 'ivr.reply.finance', { cases })], state: 'finance', caveat: 'Preliminary only — no credit decision (demo).' };
      }
      case '9': {
        await this.prisma.ivrSession.update({ where: { id: session.id }, data: { intent: 'human' } });
        return { audio: [this.voice(lang, 'ivr.reply.human')], state: 'human' };
      }
      default:
        return { audio: [this.voice(lang, 'ivr.reply.invalid')], state: 'menu' };
    }
  }

  async confirm(input: { sessionId: string; pin?: string }) {
    const session = await this.prisma.ivrSession.findUnique({ where: { id: input.sessionId } });
    if (!session) throw new NotFoundException('session_not_found');
    const lang: Lang = ((session.state as { lang?: string } | null)?.lang ?? 'en') === 'hi' ? 'hi' : 'en';
    await this.prisma.ivrSession.update({ where: { id: session.id }, data: { status: 'ENDED', endedAt: new Date(), transcript: session.transcript ?? undefined } });
    return { audio: [this.voice(lang, 'ivr.confirm')], status: 'ENDED' };
  }
}

function matchedDigit(phrase: string): string {
  const match = phrase.match(/\d/);
  if (match) return match[0];
  const lower = phrase.toLowerCase();
  if (/stock|inventory|lots?/.test(lower)) return '1';
  if (/price|rate|bhav|भाव/.test(lower)) return '2';
  if (/pickup|collect|पिकअप/.test(lower)) return '3';
  if (/finance|loan|enwr|वित्त/.test(lower)) return '4';
  if (/human|agent|operator|सहायक/.test(lower)) return '9';
  return '0';
}