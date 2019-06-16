import { asFunction, AwilixContainer, BuildResolverOptions, ClassOrFunctionReturning, ResolveOptions } from 'awilix';

import Container, { Provider, BootableProvider, Resolver } from '../Container';

const isBootableProvider = (provider: Provider | BootableProvider): provider is BootableProvider =>
  !!(provider as BootableProvider).bootableResolver;

export default class AppContainer implements Container {
  private booted: boolean = false;

  private awilixContainer: AwilixContainer;

  private bootableProviders: BootableProvider[] = [];

  public constructor({ awilixContainer }: { awilixContainer: AwilixContainer }) {
    this.awilixContainer = awilixContainer;
  }

  public get isBooted() {
    return this.booted;
  }

  private registerBootableProvider(bootableProvider: BootableProvider) {
    this.bootableProviders.push(bootableProvider);
  }

  private registerProvider(provider: Provider) {
    this.awilixContainer.register(provider.name, provider.resolver);
  }

  public register(...providers: (Provider | BootableProvider)[]) {
    providers.forEach(provider => {
      if (isBootableProvider(provider)) {
        return this.registerBootableProvider(provider);
      }

      return this.registerProvider(provider);
    });

    return this;
  }

  public async boot() {
    if (this.booted) {
      return this;
    }

    await Promise.all(
      this.bootableProviders.map(({ name, bootableResolver }) =>
        this.awilixContainer
          .build(asFunction(bootableResolver))
          .then(resolver => ({ name, resolver }))
          .then(provider => this.registerProvider(provider)),
      ),
    );

    this.booted = true;

    return this;
  }

  public resolve<T>(name: string | symbol, resolveOptions?: ResolveOptions) {
    return this.awilixContainer.resolve<T>(name, resolveOptions);
  }

  public has(name: string | symbol) {
    return this.awilixContainer.has(name);
  }

  public build<T>(targetOrResolver: ClassOrFunctionReturning<T> | Resolver<T>, options?: BuildResolverOptions<T>) {
    return this.awilixContainer.build<T>(targetOrResolver, options);
  }

  public async dispose() {
    await this.awilixContainer.dispose();

    return this;
  }
}
