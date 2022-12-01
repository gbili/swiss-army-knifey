# Swiss Army Knifey

Tools you could have gotten somewhere else, but you still decided to go this way.

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
