/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClassOrFunctionReturning, BuildResolverOptions, ResolveOptions } from 'awilix';

import { BootableProvider, Provider, Resolver } from './types';

export default interface Container {
  readonly isBooted: boolean;

  register(...providers: (Provider | BootableProvider)[]): this;

  boot(): Promise<this>;

  resolve<T>(name: string | symbol, resolveOptions?: ResolveOptions): T;

  has(name: string | symbol): boolean;

  build<T>(targetOrResolver: ClassOrFunctionReturning<T> | Resolver<T>, options?: BuildResolverOptions<T>): T;

  dispose(): Promise<this>;
}
