import type { ErrorCode } from './codes';

export class ConversationError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ConversationError';
  }
}
