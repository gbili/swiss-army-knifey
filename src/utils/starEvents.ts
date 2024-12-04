import { createLogger, Logger } from "./logger";

export type Callback = (...args: unknown[]) => void;

export interface Subscribers {
  get(eventName: string): Set<Callback>;
  add(eventName: string, callback: Callback): void;
  remove(eventName: string, callback: Callback): void;
  delete(eventName: string): void;
  clear(): void;
  toJSON(): Record<string, Callback[]>;
}

export interface EventEmitterOptions {
  logger?: Logger;
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

export const createSubscribers = (logger: Logger): Subscribers => {
  const subscriptions = new Map<string, Set<Callback>>();

  return {
    get(eventName: string): Set<Callback> {
      return subscriptions.get(eventName) || new Set();
    },

    add(eventName: string, callback: Callback): void {
      const current = this.get(eventName);
      current.add(callback);
      subscriptions.set(eventName, current);
      logger.info(`Added subscriber for event "${eventName}"`);
    },

    remove(eventName: string, callback: Callback): void {
      const current = this.get(eventName);
      const existed = current.delete(callback);
      if (existed) {
        logger.info(`Removed subscriber for event "${eventName}"`);
      }

      if (existed && current.size === 0) {
        subscriptions.delete(eventName);
        logger.info(`All subscribers removed for event "${eventName}"`);
      } else {
        subscriptions.set(eventName, current);
      }
    },

    delete(eventName: string): void {
      if (subscriptions.delete(eventName)) {
        logger.info(`Deleted all subscribers for event "${eventName}"`);
      }
    },

    clear(): void {
      subscriptions.clear();
      logger.info('Cleared all subscribers');
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

export const validateEventName = (eventName: string, isEmit = false): void => {
  if (isEmit && eventName === '*') {
    throw new Error('Cannot emit wildcard (*) event directly');
  }
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
const createEventEmitter = (options: EventEmitterOptions = {}): EventEmitter => {
  const logger = options.logger ?? createLogger();
  const subscribers = createSubscribers(logger);

  const emit: EventEmitter['emit'] = (eventName, ...params) => {
    validateEventName(eventName, true);

    const eventSubscribers = Array.from(subscribers.get(eventName));
    const starSubscribers = Array.from(subscribers.get('*'));

    logger.info(`Emitting event "${eventName}"`, ...params);

    [...eventSubscribers, ...starSubscribers].forEach((callback, index) => {
      try {
        callback(...params);
        logger.info(`Called subscriber #${index + 1} for event "${eventName}"`);
      } catch (error) {
        logger.error(
          `Error in subscriber #${index + 1} for event "${eventName}":`,
          error
        );
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
