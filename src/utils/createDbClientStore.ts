import MongoDbClient from '../infrastructure/mongoDb/MongoDbClient';

export default () => {
  let dbClient: MongoDbClient;

  return {
    getDbClient: () => {
      return dbClient;
    },
    setDbClient: (dbConn: MongoDbClient) => {
      dbClient = dbConn;
    },
  };
};
