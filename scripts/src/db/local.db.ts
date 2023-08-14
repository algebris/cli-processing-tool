import { db } from 'shared-db';

export const initLocalDb = () =>
  db
    .initialize()
    .then(async () => {
      console.log(`Connection to local DB initialized`);
    })
    .catch((err) => {
      console.error('Local DB initialization error', err);
    });

export * from 'shared-db';
