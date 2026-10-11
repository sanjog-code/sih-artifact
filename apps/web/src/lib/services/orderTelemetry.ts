'use client';

import { orderStore, OrderItem } from '../store/orderStore';

const CHANNEL_NAME = 'farmlink_order_telemetry';

type TelemetryMessage =
  | { type: 'ORDER_ADVANCED'; orderId: string; newStatus: string; timestamp: number }
  | { type: 'TELEMETRY_TICK'; timestamp: number }
  | { type: 'STREAM_STATE'; active: boolean };

class OrderTelemetryService {
  private timer: ReturnType<typeof setInterval> | null = null;
  private channel: BroadcastChannel | null = null;
  private isAutoActive: boolean = true;
  private listeners = new Set<(active: boolean) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event: MessageEvent<TelemetryMessage>) => {
            const data = event.data;
            if (data?.type === 'ORDER_ADVANCED') {
              // Trigger sync in orderStore
              window.dispatchEvent(
                new CustomEvent('farmlink_store_updated', {
                  detail: { store: 'order' },
                })
              );
            } else if (data?.type === 'STREAM_STATE') {
              this.isAutoActive = data.active;
              this.notify();
            }
          };
        }
      } catch {
        // BroadcastChannel fallback silently
      }

      this.startHeartbeat();
    }
  }

  public isRunning(): boolean {
    return this.isAutoActive;
  }

  public toggleAutoStream(): boolean {
    this.isAutoActive = !this.isAutoActive;
    if (this.channel) {
      this.channel.postMessage({ type: 'STREAM_STATE', active: this.isAutoActive });
    }
    this.notify();
    return this.isAutoActive;
  }

  public pause(): void {
    this.isAutoActive = false;
    if (this.channel) {
      this.channel.postMessage({ type: 'STREAM_STATE', active: false });
    }
    this.notify();
  }

  public resume(): void {
    this.isAutoActive = true;
    if (this.channel) {
      this.channel.postMessage({ type: 'STREAM_STATE', active: true });
    }
    this.notify();
  }

  public advanceOrder(orderId: string): OrderItem | null {
    const updated = orderStore.advanceOrderStage(orderId);
    if (updated && this.channel) {
      this.channel.postMessage({
        type: 'ORDER_ADVANCED',
        orderId,
        newStatus: updated.status,
        timestamp: Date.now(),
      });
    }
    return updated;
  }

  public advanceAll(): void {
    orderStore.advanceAllOrders();
    if (this.channel) {
      this.channel.postMessage({
        type: 'ORDER_ADVANCED',
        orderId: 'ALL',
        newStatus: 'BATCH_ADVANCED',
        timestamp: Date.now(),
      });
    }
  }

  public subscribe(listener: (active: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn(this.isAutoActive);
      } catch {
        // ignore
      }
    });
  }

  private startHeartbeat(): void {
    if (this.timer) return;

    // Run background simulation every 18 seconds
    this.timer = setInterval(() => {
      if (!this.isAutoActive) return;

      const orders = orderStore.getOrders();
      if (!orders || orders.length === 0) return;

      // Pick the earliest non-released order to progress
      const eligibleOrders = orders.filter((o) => o.status !== 'ESCROW_RELEASED');
      if (eligibleOrders.length === 0) return;

      // Deterministically advance one order per interval to simulate live real-time supply chain
      const targetOrder = eligibleOrders[Math.floor(Math.random() * eligibleOrders.length)];
      if (targetOrder) {
        this.advanceOrder(targetOrder.id);
      }
    }, 18000);
  }
}

let instance: OrderTelemetryService | null = null;

export function getOrderTelemetry(): OrderTelemetryService {
  if (!instance) {
    instance = new OrderTelemetryService();
  }
  return instance;
}
