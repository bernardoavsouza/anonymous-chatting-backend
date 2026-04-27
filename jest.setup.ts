import { Logger } from '@nestjs/common';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => undefined);

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.resetModules();
});
