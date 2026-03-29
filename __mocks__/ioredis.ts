export default jest.fn(() => {
  const store = new Map<string, string>();

  return {
    rpush: jest.fn().mockResolvedValue(0),
    del: jest.fn().mockImplementation((key: string) => {
      store.delete(key);
      return Promise.resolve(1);
    }),
    set: jest.fn().mockImplementation((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve(undefined);
    }),
    get: jest.fn().mockImplementation((key: string) => {
      return Promise.resolve(store.get(key) ?? null);
    }),
  };
});
