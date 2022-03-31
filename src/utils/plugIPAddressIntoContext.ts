export type GraphqlContext = { [k: string]: any; }

type ContextAugmentation = { IP?: string; }

export type AugmentedContext<C extends GraphqlContext> = C & ContextAugmentation;

export type GraphqlRequestContainer<C extends GraphqlContext = GraphqlContext> = {
  context: C;
  req: {
    headers?: {
      'x-forwarded-for'?: string;
    };
    socket?: {
      remoteAddress?: string;
    }
  };
};

async function plugIPAddressIntoContext<C extends GraphqlContext>({ req: { headers, socket }, context }: GraphqlRequestContainer<C>): Promise<AugmentedContext<C>> {
  const IP = headers && (headers['x-forwarded-for'] || (socket && socket.remoteAddress) || null);
  return (
    IP !== null
    ? {
      ...context,
      IP,
    }
    : context
  );
};

export default plugIPAddressIntoContext;