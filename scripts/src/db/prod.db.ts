import { Client } from 'pg';
import SSH2Promise from 'ssh2-promise';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { dbConfig, sshConfig, tunnelConfig } from './config';

let ssh: SSH2Promise;

export const wrapDbConnect = (callback: (pgClient: Client) => Promise<any>) =>
  new Promise<Client>((resolve, reject) => {
    ssh = new SSH2Promise(sshConfig as SSHConfig);
    console.log('SSH connection established');

    ssh
      .addTunnel(tunnelConfig)
      .then((tunnel) => {
        const pgClient = new Client({ ...dbConfig, port: tunnel.localPort });

        console.log(`Connecting Postgres via tunnel on ${tunnel.localPort}`);
        return pgClient.connect().then(async () => {
          if (callback) {
            const result = await callback(pgClient);
            await pgClient.end();
            await ssh.closeTunnel();
            await ssh.close();
            resolve(result);
          }
        });
      })
      .catch(reject);
  });

export { ssh };
