/* eslint-disable import/prefer-default-export */
import { Db, Collection } from 'mongodb';

export default interface InitCollection {
  readonly collectionName: string;

  init(db: Db): Promise<Collection>;
}
