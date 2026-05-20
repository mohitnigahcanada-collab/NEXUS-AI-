// Nexus AI - Event Bus (typed pub/sub for WebSocket + internal)

export interface NexusEvent {
  type: "request" | "error" | "provider_down" | "provider_up" | "budget_warning";
  timestamp: number;
  data: Record<string, unknown>;
}

type Listener = (event: NexusEvent) => void;

class EventBus {
  private listeners: Set<Listener> = new Set();

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(event: NexusEvent) {
    for (const fn of this.listeners) {
      try {
        fn(event);
      } catch {
        // Don't let listener errors break the bus
      }
    }
  }
}

export const events = new EventBus();
