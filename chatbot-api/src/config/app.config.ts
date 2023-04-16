import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: 'itBoat Chatbot',
  apiPrefix: 'api',
  port: process.env.APP_PORT || 3000,
}));
