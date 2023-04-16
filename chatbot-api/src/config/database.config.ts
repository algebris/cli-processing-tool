import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  pg: {
    port: parseInt(process.env.PG_PORT, 10) || 5432,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    userName: process.env.PG_USER_NAME,
    password: process.env.PG_PASSWORD,
  },
}));
