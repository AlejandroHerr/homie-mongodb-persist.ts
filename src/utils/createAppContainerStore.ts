import AppContainer, { appContainerFactory } from '../libs/AppContainer';

export default () => {
  let appContainer: AppContainer = appContainerFactory();

  return {
    getAppContainer: () => {
      return appContainer;
    },
    setAppContainer: (container: AppContainer) => {
      appContainer = container;
    },
  };
};
