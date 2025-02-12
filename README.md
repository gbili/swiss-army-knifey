# Swiss Army Knifey

Tools you could have gotten somewhere else, but you still decided to go this way.

## Events Emitter Usage

```typescript
import { createEventEmitter } from './utils/createEventEmitter';

// Create an event emitter instance
const emitter = createEventEmitter();

// Subscribe to events
emitter.on('userLoggedIn', (user) => {
  console.log('User logged in:', user);
});

// Subscribe to all events using wildcard
emitter.on('*', (data) => {
  console.log('Any event occurred:', data);
});

// Emit events
emitter.emit('userLoggedIn', { id: 1, name: 'John' });

// Unsubscribe from events
const callback = (data) => console.log(data);
emitter.on('notification', callback);
emitter.off('notification', callback);

// Remove all callbacks for an event
emitter.offAll('notification');
```

## Custom Logging

```typescript
import { createLogger } from './utils/logger';
import { createEventEmitter } from './utils/createEventEmitter';

// Create a logger with custom settings
const logger = createLogger({
  LOGGER_DEBUG: true, // Enable debug logs
  LOGGER_LOG: true    // Enable warning and error logs
});

// Create an event emitter with custom logger
const emitter = createEventEmitter({ logger });

// Now all events will be logged according to your settings
emitter.emit('test', 'Hello, World!');
// [2023-07-20T10:00:00.000Z] [LOG] Emitting event "test" with params: Hello, World!
```

## Error Handling

The event emitter automatically catches and logs errors in event handlers:

```typescript
const emitter = createEventEmitter();

// This handler will throw an error
emitter.on('buggy', () => {
  throw new Error('Something went wrong!');
});

// The error will be caught and logged, other handlers will still execute
emitter.emit('buggy');
```

## Type Safety

TypeScript interfaces ensure type safety:

```typescript
interface UserEvents {
  userLoggedIn: { id: number; name: string };
  userLoggedOut: { id: number };
}

// Create a type-safe event emitter
const emitter = createEventEmitter<UserEvents>();

// TypeScript will ensure correct event names and payload types
emitter.on('userLoggedIn', (user) => {
  console.log(user.name); // TypeScript knows `name` exists
});

// This would cause a type error
emitter.emit('userLoggedIn', { id: 1 }); // Error: missing 'name' property
```

## Ramda Compose With Promise

**SPLIT PROJECT**: you can now find ramda utility functions in `swiss-army-knifey-ramda`

## Sleep

### Example 0

Very simple sleep:

```ts
import { sleep, TimeUnits } from 'swiss-army-kinfey';

(async function main() {

while (1) {
  await sleep(1000);
  console.log('Sleeping forever, in 1000 milliseconds invervals')
}

while (1) {
  await sleep(1, TimeUnit.hours);
  console.log('Sleeping forever, in 1 hour invervals')
}

})();

```

The second `while` will never get executed, but you get the idea.

Need to call a function between sleep intervals ? Use `sleepForCallback` or its fixed unit equivalents:

- `sleepMillisecondsCallback`
- `sleepSecondsCallback`
- `sleepMinutesCallback`
- `sleepHoursCallback`
- `sleepDaysCallback`

### Example 1

```ts
import { sleepForCallback, TimeUnit } from 'swiss-army-knifey';

(async function main() {

  await sleepForCallback(TimeUnit.seconds)(6, (current: number, total: number, unit: TimeUnit) => {
    console.log(`Sleeping for ${total} ${unit}, but calling this on every step: ${current}${unit.substring(0,1)}`);
  });

})();
```

Output :

```txt
Sleeping for 6 seconds, but calling this on every step: 0s
Sleeping for 6 seconds, but calling this on every step: 1s
Sleeping for 6 seconds, but calling this on every step: 2s
Sleeping for 6 seconds, but calling this on every step: 3s
Sleeping for 6 seconds, but calling this on every step: 4s
Sleeping for 6 seconds, but calling this on every step: 5s
```

### Example 2

Or equivalently :

```ts
import { sleepSecondsCallback, TimeUnit } from 'swiss-army-knifey';

(async function main() {

  await sleepSecondsCallback(6, (current: number, total: number, unit: TimeUnit) => {
    console.log(`Sleeping for ${total} ${unit}, but calling this on every step: ${current}${unit.substring(0,1)}`);
  });

})();
```

Produces the same output as above

## Array

Ever wondered if you could get rid of imperative `for`/`while` loops using arrays ?

```ts
import { getArrayRange } from 'swiss-army-knifey';
getArrayRange(-4, 5); // [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
getArrayRange(0, 9); // [0, 1, 2, 3, 4, 5, 6, 7, 8 ,9]
```

## Days Before

Need to move a date back in time by a number of days ?

```ts
import { daysBefore } from 'swiss-army-knifey';

const today = new Date(); // 2022-10-11T03:14:15
daysBefore(5, today); // 2022-10-6T03:14:15
```

## Change log

**important**: since version `1.17.0` all node depending utilities are exported from file `src/node.ts` which possibly means.
