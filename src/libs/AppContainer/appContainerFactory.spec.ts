import AppContainer from './AppContainer';
import appContainerFactory from './appContainerFactory';

describe('libs/AppContainer/appContainerFactory', () => {
  it('should create a new AppContainer', () => {
    const appContainer = appContainerFactory();

    expect(appContainer).toBeInstanceOf(AppContainer);
  });
});
