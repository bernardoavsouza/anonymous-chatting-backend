import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;
  const username = process.env.REDIS_USERNAME;
  const password = process.env.REDIS_PASSWORD;
  const url = `redis://${username}:${password}@${host}:${port}`;

  return {
    host,
    port,
    username,
    password,
    url,
  };
});
