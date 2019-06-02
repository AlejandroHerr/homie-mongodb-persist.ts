import Application from '../Application';

export default () => {
  let application: Application;

  return {
    getApplication: () => {
      return application;
    },
    setApplication: (app: Application) => {
      application = app;
    },
  };
};
