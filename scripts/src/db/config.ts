import fs from 'node:fs';
import { ClientConfig } from 'pg';
import TunnelConfig from 'ssh2-promise/lib/tunnelConfig';

export const REPLACE_TOKEN = '-- REPLACE_THIS_WITH_ID';
export const QUERIES_PATH = './db/queries';
export const CURSOR_BATCH_SIZE = 500;

const privateKey = process.env.SSH_RSA_KEY_PATH && fs.readFileSync(process.env.SSH_RSA_KEY_PATH);
const remotePort = process.env.PROD_DB_PORT ? parseInt(process.env.PROD_DB_PORT, 10) : undefined;

export const sshConfig = {
  host: process.env.SSH_HOST,
  username: 'root',
  privateKey,
};

export const tunnelConfig: TunnelConfig = {
  remoteAddr: process.env.PROD_DB_HOST,
  remotePort,
};

export const dbConfig: ClientConfig = {
  host: 'localhost', // considering that tunnel has been created on localhost
  user: process.env.PROD_DB_USERNAME,
  password: process.env.PROD_DB_PASSWORD,
  database: process.env.PROD_DB_NAME,
};
