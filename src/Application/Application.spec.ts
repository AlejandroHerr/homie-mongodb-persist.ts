import util from 'util';
import { createContainer, asValue } from 'awilix';

import Application from './Application';

const setup = () => {
  const container = createContainer();
  const application = new Application({ container });

  return {
    container,
    application,
  };
};

describe('Application', () => {
  it('Application.createApplication should create an Application with a container', () => {
    const application = Application.createApplication();
    const value = 'test0';
    const provider = { name: 'name0', resolver: asValue(value) };

    application.register(provider);

    expect(application.has(provider.name)).toBeTruthy();
    expect(application.resolve(provider.name)).toBe(value);
  });
  describe('should compose AwilixContainer', () => {
    const { application, container } = setup();

    it('.register should register a dependency in the AwilixContainer', () => {
      const value = 'test0';
      const provider = { name: 'name0', resolver: asValue(value) };

      application.register(provider);

      expect(application.has(provider.name)).toBeTruthy();
      expect(application.resolve(provider.name)).toBe(value);
    });

    it('.register should should register an array of dependency in the AwilixContainer', () => {
      const values = ['test2', 'test3'];
      const providers = [
        { name: 'name2', resolver: asValue(values[0]) },
        { name: 'name3', resolver: asValue(values[1]) },
      ];

      application.register(providers);

      providers.forEach((provider, index) => {
        expect(application.has(provider.name)).toBeTruthy();
        expect(application.resolve(provider.name)).toBe(values[index]);
      });
    });

    it('.build should call AwilixContainer.build method', () => {
      const resolver = asValue('value');

      container.build = jest.fn();

      application.build(resolver);

      expect(container.build).toHaveBeenCalledTimes(1);
      expect(container.build).toHaveBeenCalledWith(resolver, undefined);

      (container.build as jest.Mock).mockRestore();
    });

    it('.dispose should call AwilixContainer.dispose method', async () => {
      container.dispose = jest.fn();

      await application.dispose();

      expect(container.dispose).toHaveBeenCalledTimes(1);

      (container.dispose as jest.Mock).mockRestore();
    });

    it('should console.log as the container', async () => {
      expect(application[util.inspect.custom]()).toBe(`{ container: ${container.inspect(0)} }`);
    });
  });

  describe('asyncProviders', () => {
    it('.register should register an async dependency in the AwilixContainer after boot', async () => {
      const { application } = setup();

      const value = 'testValue';
      const provider = { name: 'name', asyncResolver: () => Promise.resolve(asValue(value)) };

      application.register(provider);

      expect(application.has(provider.name)).toBeFalsy();

      await application.boot();

      expect(application.has(provider.name)).toBeTruthy();
      expect(application.resolve(provider.name)).toBe(value);
    });

    it('.boot should respect the registration order', async () => {
      const { application } = setup();

      const value = 'testValue';
      const providers = [
        { name: 'name0', asyncResolver: () => Promise.resolve(asValue(value)) },
        { name: 'name1', asyncResolver: ({ name0 }: { name0: string }) => Promise.resolve(asValue(name0)) },
      ];

      application.register(providers);

      providers.forEach(provider => {
        expect(application.has(provider.name)).toBeFalsy();
      });

      await application.boot();

      providers.forEach(provider => {
        expect(application.has(provider.name)).toBeTruthy();
        expect(application.resolve(provider.name)).toBe(value);
      });
    });

    it('.boot should not boot again if it is already booted', async () => {
      const { application } = setup();

      const provider = { name: 'name', asyncResolver: jest.fn() };

      application.register(provider);

      await application.boot();
      await application.boot();

      expect(provider.asyncResolver).toHaveBeenCalledTimes(1);
    });
  });
});
