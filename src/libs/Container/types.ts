/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resolver as AwilixResolver } from 'awilix';

export type Resolver<T = any> = AwilixResolver<T>;

export type BootableResolver<T = any> = (craddle: any) => Promise<Resolver<T>>;

export interface Provider<T = any> {
  name: string | symbol;
  resolver: Resolver<T>;
}

export interface BootableProvider<T = any> {
  name: string | symbol;
  bootableResolver: BootableResolver<T>;
}
