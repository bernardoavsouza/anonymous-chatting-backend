export default jest.fn(() => ({
  rpush: jest.fn(),
  del: jest.fn(),
}));
