import { dummyTimestamp } from '~/dummies';

const OriginalDate = global.Date;

export const mockDate = (): void => {
  jest.spyOn(global, 'Date').mockImplementation((...args) => {
    if (args.length > 0) {
      return new OriginalDate(...args);
    }
    return new OriginalDate(dummyTimestamp);
  });
};
