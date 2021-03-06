import { asFunction } from 'awilix';
import { MongoClient, Db } from 'mongodb';
import { Logger } from 'pino';

import { Config } from '../config';
import { BootableProvider } from '../libs/Container';

const MongoDbClientServiceProvider: BootableProvider<Db> = Object.freeze({
  name: 'mongoDbClient',
  async bootableResolver({ config: { mongodb }, logger }: { config: Config; logger: Logger }) {
    const mongoUri = `mongodb://${mongodb.host}:${mongodb.port}/${mongodb.dbName}`;

    const client = new MongoClient(mongoUri, {
      useNewUrlParser: true,
    });

    await client.connect();

    logger.info(`Connected to ${mongoUri}`);

    return asFunction(() => client.db())
      .singleton()
      .disposer(() => client.close());
  },
});

export default MongoDbClientServiceProvider;
