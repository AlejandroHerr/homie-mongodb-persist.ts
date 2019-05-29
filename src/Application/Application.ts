import util from 'util';
import {
  createContainer,
  asFunction,
  AwilixContainer,
  BuildResolverOptions,
  ClassOrFunctionReturning,
  ResolveOptions,
  Resolver,
  ContainerOptions,
} from 'awilix';

import { AsyncProvider, AsyncResolver, Provider } from './types';

const isAsyncProvider = (provider: Provider | AsyncProvider): provider is AsyncProvider =>
  !!(provider as AsyncProvider).asyncResolver;

export default class Application {
  private booted: boolean = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private bootableProviders: Map<string | symbol, AsyncResolver<any>> = new Map();

  private container: AwilixContainer;

  public static createApplication(options?: ContainerOptions) {
    return new Application({ container: createContainer(options) });
  }

  public constructor({ container }: { container: AwilixContainer }) {
    this.container = container;
  }

  private registerProvider(provider: Provider) {
    this.container.register(provider.name, provider.resolver);

    return this;
  }

  private registerAsyncProvider(asyncProvider: AsyncProvider) {
    this.bootableProviders.set(asyncProvider.name, asyncProvider.asyncResolver);

    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public register<T = any>(descriptor: (Provider | AsyncProvider)[] | Provider<T> | AsyncProvider<T>) {
    if (Array.isArray(descriptor)) {
      descriptor.forEach(provider => this.register<T>(provider));

      return this;
    }

    if (isAsyncProvider(descriptor)) {
      return this.registerAsyncProvider(descriptor);
    }

    return this.registerProvider(descriptor);
  }

  public async boot() {
    if (this.booted) {
      return this;
    }

    this.booted = true;

    // eslint-disable-next-line no-restricted-syntax
    for await (const [name, asyncResolver] of this.bootableProviders) {
      const resolver = await this.container.build(asFunction(asyncResolver));

      this.container.register(name, resolver);
    }

    return this;
  }

  public has(name: string | symbol) {
    return this.container.has(name);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public build<T>(targetOrResolver: ClassOrFunctionReturning<T> | Resolver<T>, opts?: BuildResolverOptions<T>) {
    return this.container.build<T>(targetOrResolver, opts);
  }

  public resolve<T>(name: string | symbol, resolveOptions?: ResolveOptions | undefined) {
    return this.container.resolve<T>(name, resolveOptions);
  }

  public async dispose() {
    await this.container.dispose();

    return this;
  }

  public [util.inspect.custom]() {
    return `{ container: ${this.container.inspect(0)} }`;
  }
}
