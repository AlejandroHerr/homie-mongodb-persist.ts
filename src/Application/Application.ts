import util from 'util';
import {
  createContainer,
  asFunction,
  AwilixContainer,
  BuildResolverOptions,
  ClassOrFunctionReturning,
  ResolveOptions,
  ContainerOptions,
} from 'awilix';

import {
  AsyncProvider,
  AsyncResolver,
  Provider,
  Resolver,
  isProvider,
  isProviderArray,
  isAsyncProvider,
} from './types';

export default class Application {
  private booted: boolean = false;

  private bootableProviders: Map<string | symbol, AsyncResolver> = new Map();

  public readonly container: AwilixContainer;

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

  private registerAsyncProvider({ name, asyncResolver }: AsyncProvider) {
    this.bootableProviders.set(name, asyncResolver);

    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public register(...descriptors: (Provider | AsyncProvider)[]) {
    descriptors.forEach(descriptor => {
      if (isAsyncProvider(descriptor)) {
        return this.registerAsyncProvider(descriptor);
      }

      return this.registerProvider(descriptor);
    });

    return this;
  }

  public async boot() {
    if (this.booted) {
      return this;
    }

    this.booted = true;

    // eslint-disable-next-line no-restricted-syntax
    for await (const [name, asyncResolver] of this.bootableProviders) {
      const resolverOrProvider = await this.container.build(asFunction(asyncResolver));

      if (isProviderArray(resolverOrProvider)) {
        this.register(...resolverOrProvider);
      } else if (isProvider(resolverOrProvider)) {
        this.register(resolverOrProvider);
      } else {
        this.container.register(name, resolverOrProvider);
      }
    }

    return this;
  }

  public has(name: string | symbol) {
    return this.container.has(name);
  }

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
