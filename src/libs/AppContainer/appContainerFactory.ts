import { createContainer } from 'awilix';
import AppContainer from './AppContainer';

export default () => {
  const awilixContainer = createContainer();

  return new AppContainer({ awilixContainer });
};
