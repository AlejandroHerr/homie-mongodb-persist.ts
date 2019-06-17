import AppContainer, { appContainerFactory } from '../libs/AppContainer';

export default () => {
  const appContainer: AppContainer = appContainerFactory();

  return {
    getAppContainer: () => {
      return appContainer;
    },
  };
};
