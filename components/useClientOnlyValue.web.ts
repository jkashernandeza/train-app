// `useClientOnlyValue` web implementation
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  if (typeof window === 'undefined') {
    return server;
  }
  return client;
}
