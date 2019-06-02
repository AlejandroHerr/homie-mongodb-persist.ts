import { asFunction } from 'awilix';
import pino, { Logger } from 'pino';
import { Provider } from '../Application';

const LoggerProvider: Provider<Logger> = Object.freeze({
  name: 'logger',
  resolver: asFunction(() =>
    pino({
      enabled: process.env.NODE_ENV !== 'testing',
    }),
  ),
});

export default LoggerProvider;
