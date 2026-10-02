export const ORDER_FLOW = {
  CONSUMER: {
    transitions: {
      PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PACKING', 'DISPATCHED', 'CANCELLED', 'PARTIALLY_DELIVERED'],
      PACKING: ['DISPATCHED', 'CANCELLED', 'PARTIALLY_DELIVERED'],
      DISPATCHED: ['DELIVERED', 'PARTIALLY_DELIVERED', 'RETURNED', 'CANCELLED'],
      DELIVERED: ['RETURNED', 'REFUNDED'],
      PARTIALLY_DELIVERED: ['DISPATCHED', 'DELIVERED'],
      RETURNED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: [],
    } as Record<string, string[]>,
  },
  BULK: {
    transitions: {
      DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
      PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
      CONFIRMED: ['PACKING', 'DISPATCHED', 'CANCELLED'],
      PACKING: ['DISPATCHED', 'CANCELLED'],
      DISPATCHED: ['DELIVERED', 'PARTIALLY_DELIVERED'],
      PARTIALLY_DELIVERED: ['DELIVERED'],
      DELIVERED: ['RETURNED', 'REFUNDED'],
      RETURNED: ['REFUNDED'],
      CANCELLED: [],
      EXPIRED: [],
      REFUNDED: [],
    } as Record<string, string[]>,
  },
} as const;

export type OrderType = keyof typeof ORDER_FLOW;
export type OrderState = string;

export function canTransitionOrder(type: OrderType, from: string, to: string): boolean {
  const allowed = ORDER_FLOW[type]?.transitions[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

export function nextStates(type: OrderType, state: string): string[] {
  return ORDER_FLOW[type]?.transitions[state] ?? [];
}

export const PAYMENT_STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['SUCCESS', 'FAILED'],
  SUCCESS: ['REFUNDED'],
  FAILED: ['PENDING', 'REFUNDED'],
  REFUNDED: [],
};

export function canTransitionPayment(from: string, to: string): boolean {
  return (PAYMENT_STATUS_FLOW[from] ?? []).includes(to);
}