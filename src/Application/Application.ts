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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncResolver<T> = (cradle: any) => Promise<Resolver<T>>;

export interface Provider<T> {
  name: string;
  resolver: Resolver<T>;
}

export interface AsyncProvider<T> {
  name: string;
  asyncResolver: AsyncResolver<T>;
}

const isAsyncProvider = <T>(provider: Provider<T> | AsyncProvider<T>): provider is AsyncProvider<T> =>
  !!(provider as AsyncProvider<T>).asyncResolver;

export default class Application {
  private booted: boolean = false;

  private bootableProviders: Map<string | symbol, AsyncResolver<{}>> = new Map();

  private container: AwilixContainer;

  public static createApplication(options?: ContainerOptions) {
    return new Application({ container: createContainer(options) });
  }

  public constructor({ container }: { container: AwilixContainer }) {
    this.container = container;
  }

  private registerProvider<T>(provider: Provider<T>) {
    this.container.register(provider.name, provider.resolver);

    return this;
  }

  private registerAsyncProvider<T>(asyncProvider: AsyncProvider<T>) {
    this.bootableProviders.set(asyncProvider.name, asyncProvider.asyncResolver);

    return this;
  }

  public register<T>(descriptor: (Provider<T> | AsyncProvider<T>)[] | Provider<T> | AsyncProvider<T>) {
    if (Array.isArray(descriptor)) {
      descriptor.forEach(provider => this.register(provider));

      return this;
    }

    if (isAsyncProvider(descriptor)) {
      return this.registerAsyncProvider<T>(descriptor);
    }

    return this.registerProvider<T>(descriptor);
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
