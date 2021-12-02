type NexmoInstance = { message: { sendSms: (from: string, to: string, text: string, options: { type: string; }, cb: (err: Error, res: string) => void) => void }; };
type NexmoInstanceGen = (a: { apiKey: string; apiSecret: string; }, b: { debug: boolean; }) => NexmoInstance;
type Logger = { log: (...args: any[]) => void; }

export default (apiKey: string, apiSecret: string, toList: string[], logger: Logger, getNexmoInstance: NexmoInstanceGen) => async function (from: string, text: string) {
  const nexmo = getNexmoInstance({ apiKey, apiSecret }, { debug: true });
  return await Promise.all(toList.map(to => {
    logger.log('to', to);
    logger.log('from', from);
    logger.log('text', text);
    return new Promise(function (resolve: (res: string) => void, reject: (err: Error) => void) {
      nexmo.message.sendSms(from, to, text, { type: 'unicode' }, (err: Error, res: string) => {
        if (err) {
          reject(err);
          return;
        }
        logger.log(res);
        resolve(res);
      });
    });
  }));
}