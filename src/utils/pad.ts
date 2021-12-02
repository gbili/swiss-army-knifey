export function pad(subject: string|number, chars: string, finalLenWithPadding: number, position: 'start' | 'end' = 'start') {
  const str = `${subject}`;
  const missingCount = finalLenWithPadding - str.length;
  if (missingCount <= 0) return str;
  const times = Math.floor(missingCount / chars.length);
  const diff = missingCount % chars.length;
  const padAdd = chars.repeat(times) + chars.slice(0, diff);
  return position === 'start' ? padAdd + str : str + padAdd;
}

export function zeroPadded(num: number, len: number = 2): string {
  return pad(num, "0", len, "start");
}

export default pad;