export default function isError (o: any): boolean {
  return o && o.stack && o.message;
}