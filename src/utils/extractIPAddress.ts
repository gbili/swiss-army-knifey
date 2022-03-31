type Req = {
  headers: { 'x-forwarded-for': string; };
  socket: { remoteAddress?: string; };
} | {
  headers: { 'x-forwarded-for'?: string; };
  socket: { remoteAddress: string; };
};

export function extractIPAddress(req: Req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}