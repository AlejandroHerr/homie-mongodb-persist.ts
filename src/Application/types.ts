/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resolver as AwilixResolver } from 'awilix';

export type Resolver<T = any> = AwilixResolver<T>;

export type AsyncResolver<T = any> = (cradle: any) => Promise<Provider<T> | Resolver<T> | Provider<T>[]>;

export interface AsyncProvider<T = any> {
  name: string;
  asyncResolver: AsyncResolver<T>;
}

export interface Provider<T = any> {
  name: string;
  resolver: Resolver<T>;
}

export const isAsyncProvider = (provider: AsyncProvider | unknown): provider is AsyncProvider =>
  !!(provider as AsyncProvider).asyncResolver;

export const isProviderArray = (providerArray: Provider[] | unknown): providerArray is Provider[] =>
  Array.isArray(providerArray);

export const isProvider = (providerOrResolver: Provider | unknown): providerOrResolver is Provider =>
  !!(providerOrResolver as Provider).name;
