export type Callback = (...args: unknown[]) => void;

export interface Subscribers {
  get(eventName: string): Set<Callback>;
  add(eventName: string, callback: Callback): void;
  remove(eventName: string, callback: Callback): void;
  delete(eventName: string): void;
  clear(): void;
  toJSON(): Record<string, Callback[]>;
}

export interface EventEmitter {
  /** Current subscriptions for debugging purposes */
  readonly subscriptions: Record<string, Callback[]>;

  /**
   * Emit an event to all subscribers
   * @param eventName - Name of the event to emit
   * @param params - Parameters to pass to the callbacks
   * @throws {Error} If attempting to emit the wildcard event directly
   */
  emit: (eventName: string, ...params: unknown[]) => void;

  /**
   * Subscribe to an event
   * @param eventName - Name of the event or '*' for all events
   * @param callback - Function to call when the event is emitted
   */
  on: (eventName: string, callback: Callback) => void;

  /**
   * Unsubscribe from an event
   * @param eventName - Name of the event
   * @param callback - Function to remove from subscribers
   */
  off: (eventName: string, callback: Callback) => void;

  /**
   * Remove all subscribers for a specific event
   * @param eventName - Name of the event to clear
   */
  offAll: (eventName: string) => void;
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

    clear(): void {
      subscriptions.clear();
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

/**
 * Creates an event emitter with support for wildcards and error handling
 *
 * Features:
 * - Wildcard (*) subscriptions receive all events
 * - Error handling in event callbacks
 * - Type-safe event handling
 * - Memory leak prevention with automatic cleanup
 */
const createEventEmitter = (): EventEmitter => {
  const subscribers = createSubscribers();

  const validateEventName = (eventName: string, isEmit = false): void => {
    if (isEmit && eventName === '*') {
      throw new Error('Cannot emit wildcard (*) event directly');
    }
  };

  const emit: EventEmitter['emit'] = (eventName, ...params) => {
    validateEventName(eventName, true);

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
    validateEventName(eventName);
    subscribers.add(eventName, callback);
  };

  const off: EventEmitter['off'] = (eventName, callback) => {
    validateEventName(eventName);
    subscribers.remove(eventName, callback);
  };

  const offAll: EventEmitter['offAll'] = (eventName) => {
    validateEventName(eventName);
    subscribers.delete(eventName);
  };

  return {
    get subscriptions() {
      return subscribers.toJSON();
    },
    emit,
    on,
    off,
    offAll
  };
};

export default createEventEmitter;
