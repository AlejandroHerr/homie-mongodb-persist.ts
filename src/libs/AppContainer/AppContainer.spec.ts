import { createContainer, asValue, asFunction } from 'awilix';

import AppContainer from './AppContainer';

const setup = () => {
  const awilixContainer = createContainer();
  const appContainer = new AppContainer({ awilixContainer });

  return appContainer;
};

describe('libs/AppContainer', () => {
  it('.register should register Providers', () => {
    const appContainer = setup();

    const providers = [
      { name: 'service0', resolver: asValue('serviceValue0') },
      { name: 'service1', resolver: asValue('serviceValue1') },
    ];

    appContainer.register(...providers);

    expect(appContainer.resolve<string>(providers[0].name)).toBe('serviceValue0');
    expect(appContainer.resolve<string>(providers[1].name)).toBe('serviceValue1');
  });

  it('.register should pre-register BootableProviders to be registered when .boot is called', async () => {
    const appContainer = setup();

    const providers = [
      { name: 'service0', bootableResolver: () => Promise.resolve(asValue('serviceValue0')) },
      { name: 'service1', bootableResolver: () => Promise.resolve(asValue('serviceValue1')) },
    ];

    await appContainer.register(...providers).boot();

    expect(appContainer.resolve<string>(providers[0].name)).toBe('serviceValue0');
    expect(appContainer.resolve<string>(providers[1].name)).toBe('serviceValue1');
  });

  it('.boot should not boot again if container is already booted', async () => {
    const appContainer = setup();

    const provider = { name: 'service0', bootableResolver: jest.fn(() => Promise.resolve(asValue('serviceValue0'))) };

    await appContainer.register(provider).boot();
    await appContainer.boot();

    expect(provider.bootableResolver).toHaveBeenCalledTimes(1);
  });

  it('.isBooted should return if AppContainer has been booted', async () => {
    const appContainer = setup();

    expect(appContainer.isBooted).toBeFalsy();

    await appContainer.boot();

    expect(appContainer.isBooted).toBeTruthy();
  });

  it('.has should return if a provider is registered', () => {
    const appContainer = setup();

    const provider = { name: 'service0', resolver: asValue('serviceValue0') };

    appContainer.register(provider);

    expect(appContainer.has(provider.name)).toBeTruthy();
    expect(appContainer.has('name')).toBeFalsy();
  });

  it('.build should build a Resolver with the registerd providers', () => {
    const appContainer = setup();

    const provider = { name: 'service0', resolver: asValue('serviceValue0') };
    const providerToBuild = asFunction(({ service0 }: { service0: string }) => service0.toUpperCase());

    appContainer.register(provider);

    expect(appContainer.build(providerToBuild)).toBe('SERVICEVALUE0');
  });

  it('.dispose should dispose the containers', async () => {
    const appContainer = setup();
    const disposer = jest.fn();
    const provider = {
      name: 'service0',
      resolver: asFunction(() => 'value')
        .disposer(() => disposer())
        .singleton(),
    };

    appContainer.register(provider).resolve(provider.name);

    await appContainer.dispose();

    expect(disposer).toHaveBeenCalled();
  });
});
