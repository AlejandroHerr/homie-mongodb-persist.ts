import { Resolver } from 'awilix';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncResolver<T> = (cradle: any) => Promise<Resolver<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AsyncProvider<T = any> {
  name: string;
  asyncResolver: AsyncResolver<T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Provider<T = any> {
  name: string;
  resolver: Resolver<T>;
}
