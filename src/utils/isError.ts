export default function isError (o: any):o is Error {
  return o && o.stack && o.message;
}