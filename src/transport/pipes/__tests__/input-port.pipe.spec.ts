import { ConversationLeaveInputDTO } from '@/transport/conversation/dto';
import { dummyConversation, dummyDate } from '~/dummies';
import { mockDate } from '~/globals/date';
import { InputPortPipe } from '../input-port.pipe';

describe('InputPortPipe', () => {
  let pipe: InputPortPipe<ConversationLeaveInputDTO>;

  beforeAll(() => {
    mockDate();
  });

  beforeEach(() => {
    pipe = new InputPortPipe(ConversationLeaveInputDTO);
  });

  it('should wrap valid data in an InputPort with a timestamp', async () => {
    const result = await pipe.transform({ conversationId: dummyConversation.id });

    expect(result).toEqual({
      data: { conversationId: dummyConversation.id },
      timestamp: dummyDate,
    });
  });

  it('should throw when a required field is missing', async () => {
    await expect(pipe.transform({})).rejects.toBeDefined();
  });

  it('should throw when a field fails UUID validation', async () => {
    await expect(pipe.transform({ conversationId: 'not-a-uuid' })).rejects.toBeDefined();
  });

  it('should throw when an unknown field is provided', async () => {
    await expect(pipe.transform({ conversationId: dummyConversation.id, extra: 'field' })).rejects.toBeDefined();
  });

  it('should return a data instance of the provided DTO class', async () => {
    const result = await pipe.transform({ conversationId: dummyConversation.id });

    expect(result.data).toBeInstanceOf(ConversationLeaveInputDTO);
  });
});
