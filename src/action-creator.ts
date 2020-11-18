/**
 * Given an argument, return `true` if it is not `undefined` or `null`.
 */
export const isDefined = <T>(x: T): x is NonNullable<T> => {
  return x != null;
};

export interface GenericAction<T extends string, P> {
  type: T;
  payload: P;
}

export interface PayloadContainer<P> {
  _payload: P;
}

type PayloadFactory<P> = (payload: P) => PayloadContainer<P>;

export const payload = <P>(): PayloadFactory<P> => (_payload: P) => ({
  _payload,
});

export function Action<T extends string>(
  type: T
): () => GenericAction<T, unknown>;

export function Action<T extends string, P>(
  type: T,
  payloadFactory: PayloadFactory<P>
): (p: P) => GenericAction<T, P>;

export function Action<T extends string, P>(
  type: T,
  payloadFactory?: PayloadFactory<P>
) {
  if (isDefined(payloadFactory)) {
    // eslint-disable-next-line no-shadow
    return (payload: P): GenericAction<T, P> => {
      const { _payload } = payloadFactory(payload);

      return {
        type,
        payload: _payload,
      };
    };
  }

  return (): GenericAction<T, unknown> => {
    return {
      type,
      payload: {},
    };
  };
}
