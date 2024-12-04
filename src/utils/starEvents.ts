export type Callback = (...args: unknown[]) => void;

export interface Subscribers {
  get(eventName: string): Set<Callback>;
  add(eventName: string, callback: Callback): void;
  remove(eventName: string, callback: Callback): void;
  delete(eventName: string): void;
  toJSON(): Record<string, Callback[]>;
}

export interface EventEmitter {
  subscriptions: Record<string, Callback[]>;
  emit: (eventName: string, ...params: unknown[]) => void;
  on: (eventName: string, callback: Callback) => void;
  off: (eventName: string, callback: Callback) => void;
}

export const createSubscribers = (): Subscribers => {
  const subscriptions = new Map<string, Set<Callback>>();

  return {
    get(eventName: string): Set<Callback> {
      return subscriptions.get(eventName) || new Set();
    },

    add(eventName: string, callback: Callback): void {
      const current = this.get(eventName);
      current.add(callback);
      subscriptions.set(eventName, current);
    },

    remove(eventName: string, callback: Callback): void {
      const current = this.get(eventName);
      current.delete(callback);

      if (current.size === 0) {
        subscriptions.delete(eventName);
      } else {
        subscriptions.set(eventName, current);
      }
    },

    delete(eventName: string): void {
      subscriptions.delete(eventName);
    },

    toJSON(): Record<string, Callback[]> {
      return Object.fromEntries(
        Array.from(subscriptions.entries()).map(([key, value]) => [
          key,
          Array.from(value)
        ])
      );
    }
  };
};

const createEventEmitter = (): EventEmitter => {
  const subscribers = createSubscribers();

  const emit: EventEmitter['emit'] = (eventName, ...params) => {
    const eventSubscribers = Array.from(subscribers.get(eventName));
    const starSubscribers = Array.from(subscribers.get('*'));

    [...eventSubscribers, ...starSubscribers].forEach(callback => {
      try {
        callback(...params);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  };

  const on: EventEmitter['on'] = (eventName, callback) => {
    subscribers.add(eventName, callback);
  };

  const off: EventEmitter['off'] = (eventName, callback) => {
    subscribers.remove(eventName, callback);
  };

  return {
    get subscriptions() {
      return subscribers.toJSON();
    },
    emit,
    on,
    off,
  };
};

export default createEventEmitter;
