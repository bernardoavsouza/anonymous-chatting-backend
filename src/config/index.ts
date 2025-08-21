import redisConfig from './redis';

export default (): Record<string, unknown> => ({
  ...redisConfig(),
});
