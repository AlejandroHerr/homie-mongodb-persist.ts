import { asFunction } from 'awilix';
import { MongoClient, Db } from 'mongodb';
import { Logger } from 'pino';

import { AsyncProvider } from '../../Application';
import { Config } from '../../config';

const MongoDbClientServiceProvider: AsyncProvider<Db> = Object.freeze({
  name: 'database',
  async asyncResolver({ config: { mongodb }, logger }: { config: Config; logger: Logger }) {
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
