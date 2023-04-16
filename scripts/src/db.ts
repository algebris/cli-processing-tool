import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';
import { Client, ClientConfig } from 'pg';
import SSH2Promise from 'ssh2-promise';
import TunnelConfig from 'ssh2-promise/lib/tunnelConfig';
import SSHConfig from 'ssh2-promise/lib/sshConfig';

// this loads .env from root folder of multirepo
dotenv.config({ path: path.resolve(`${process.cwd()}/../`, '.env') });

let ssh: SSH2Promise, tunnel;
const privateKey = process.env.SSH_RSA_KEY_PATH && fs.readFileSync(process.env.SSH_RSA_KEY_PATH);
const remotePort = process.env.PROD_DB_PORT ? parseInt(process.env.PROD_DB_PORT, 10) : undefined;

const sshConfig = {
  host: process.env.SSH_HOST,
  username: 'root',
  privateKey
};
const tunnelConfig: TunnelConfig = {
  remoteAddr: process.env.PROD_DB_HOST, 
  remotePort,
};

const dbConfig: ClientConfig = {
  host: 'localhost', // considering that tunnel has been created on localhost
  user: process.env.PROD_DB_USERNAME,
  password: process.env.PROD_DB_PASSWORD,
  database: process.env.PROD_DB_NAME,
};

export const client = new Promise<Client>(async (resolve, reject) => {
  try {
    ssh = new SSH2Promise(sshConfig as SSHConfig);
    console.log(`SSH connection established`);
  
    tunnel = await ssh.addTunnel(tunnelConfig);
    const pgClient = new Client({ ...dbConfig, port: tunnel.localPort });
    
    console.log(`Connecting Postgres via tunnel on ${tunnel.localPort}`);
    pgClient.connect();
    resolve(pgClient);
  } catch(err) {
    reject(err);
  }
});

export { ssh };