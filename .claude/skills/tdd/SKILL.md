---
name: tdd
description: >
  Drives test-first development (TDD) in this NestJS anonymous-chat backend.
  Use this skill whenever the user asks to add a feature, fix a bug, or create
  a new use case, gateway, or datasource method. It writes the failing spec
  first, then guides the minimal implementation to make it pass. Trigger on
  phrases like "add a use case", "write tests for", "implement X", "TDD this",
  "test first", or any request to build something new in the project.
---

## TDD Cycle

Red → Green → Refactor. Write a failing test first, implement just enough to
pass it, then clean up. Never write implementation before the test exists.

---

## 1. Identify the Layer

Before writing anything, determine which layer the new code belongs to:

| Layer                 | Location                   | What it does                                  |
| --------------------- | -------------------------- | --------------------------------------------- |
| **Domain UseCase**    | `src/domain/.../usecases/` | Business logic; depends on `RedisDatasource`  |
| **Datasource**        | `src/datasource/redis/`    | Raw Redis operations via `ioredis`            |
| **Transport Gateway** | `src/transport/`           | WebSocket event handlers; depends on UseCases |

The layer determines which mock strategy and which test structure to use.

---

## 2. Test File Location

Tests live in a `__tests__/` subdirectory next to the source file:

```
src/domain/conversation/usecases/connect.usecase.ts
src/domain/conversation/__tests__/connect.spec.ts

src/transport/app.gateway.ts
src/transport/__tests__/gateway-connection.spec.ts
```

---

## 3. Spec Structures by Layer

### Domain UseCase spec

The datasource is mocked with a plain object — no `jest.mock()` needed because
NestJS DI handles substitution:

```typescript
import { RedisDatasource } from '@/datasource/redis/datasource';
import { MyUseCase } from '@/domain/conversation/usecases/my.usecase';
import { ConversationError } from '@/transport/errors/conversation.error';
import { ErrorCode } from '@/transport/errors/codes';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyUsers } from '~/dummies';

describe('MyUseCase', () => {
  let useCase: MyUseCase;

  const redisMock = {
    someRedisMethod: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const app = await Test.createTestingModule({
      providers: [MyUseCase, { provide: RedisDatasource, useValue: redisMock }],
    }).compile();

    useCase = app.get(MyUseCase);
  });

  // happy path
  it('should ...', async () => {
    redisMock.someRedisMethod.mockResolvedValueOnce(/* expected data */);
    const result = await useCase.execute({
      /* input */
    });
    expect(result).toEqual(/* expected */);
  });

  // Redis failure
  it('should throw ConversationError when redis rejects', async () => {
    redisMock.someRedisMethod.mockRejectedValueOnce(new Error('redis down'));
    await expect(
      useCase.execute({
        /* input */
      }),
    ).rejects.toBeInstanceOf(ConversationError);
  });

  // domain rule violation
  it('should throw ConversationError with NOT_IN_ROOM when ...', async () => {
    // arrange so the rule is violated
    await expect(
      useCase.execute({
        /* input */
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.NOT_IN_ROOM,
    });
  });
});
```

### Transport Gateway spec

Use cases are mocked with `{ execute: jest.fn() }`. The socket is created with
`MockedSocket()` from `~/socket.io`.

```typescript
import { MyUseCase } from '@/domain/conversation/usecases/my.usecase';
import { MyGateway } from '@/transport/conversation/my.gateway';
import { ConversationEvent } from '@/transport/conversation/types';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import type { AppSocket } from '@/transport/types';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';

describe('MyGateway', () => {
  let gateway: MyGateway;
  let socket: AppSocket;

  const myUseCaseMock = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    myUseCaseMock.execute.mockResolvedValue(/* default happy-path return */);
    socket = MockedSocket();
    socket.data = {
      userId: dummyUsers[0].id,
      nickname: dummyUsers[0].nickname,
      conversationId: dummyConversation.id,
    };

    const app = await Test.createTestingModule({
      providers: [MyGateway, { provide: MyUseCase, useValue: myUseCaseMock }],
    }).compile();

    gateway = app.get(MyGateway);
  });

  it('should call use case with correct input', async () => {
    await gateway.handleSomeEvent(socket, {
      data: {
        /* payload */
      },
      timestamp: new Date(),
    });
    expect(myUseCaseMock.execute).toHaveBeenCalledWith({
      /* expected */
    });
  });

  it('should emit NOT_IN_ROOM error when socket has no conversationId', async () => {
    socket.data = {};
    await gateway.handleSomeEvent(socket, {
      data: {
        /* payload */
      },
      timestamp: new Date(),
    });
    expect(socket.emit).toHaveBeenCalledWith('error', {
      code: ErrorCode.NOT_IN_ROOM,
      message: expect.any(String),
    });
  });

  it('should broadcast result to room', async () => {
    await gateway.handleSomeEvent(socket, {
      data: {
        /* payload */
      },
      timestamp: new Date(),
    });
    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.to(dummyConversation.id).emit).toHaveBeenCalledWith(
      ConversationEvent.MESSAGE,
      expect.objectContaining({ data: expect.any(Object), timestamp: expect.any(Date) }),
    );
  });
});
```

### Datasource spec

The ioredis client is mocked automatically via `__mocks__/ioredis.ts` (a
Map-based in-memory store). Import the class under test and the Redis client
normally — Jest wires the mock automatically.

```typescript
import { RedisDatasource } from '@/datasource/redis/datasource';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyUsers } from '~/dummies';

describe('RedisDatasource - someMethod', () => {
  let datasource: RedisDatasource;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [RedisDatasource],
    }).compile();

    datasource = app.get(RedisDatasource);
  });

  it('should store and retrieve ...', async () => {
    await datasource.someMethod(/* input */);
    const result = await datasource.getDetails(/* id */);
    expect(result).toMatchObject({
      /* expected */
    });
  });
});
```

---

## 4. Required Test Cases Per Use Case

Every new use case spec must include all three categories:

1. **Happy path** — normal inputs produce expected output and call Redis correctly
2. **Redis failure** — `mockRejectedValueOnce(new Error(...))` on each Redis call
   that can fail → assert `rejects.toBeInstanceOf(ConversationError)`
3. **Domain rule violations** — inputs that break a business rule → assert the
   correct `ErrorCode` via `rejects.toMatchObject({ code: ErrorCode.X })`

For gateways, also cover:

- **Auth / guard failures** — missing `socket.data` fields emit `NOT_IN_ROOM` error
- **Use case failure propagation** — `execute` rejects with `ConversationError` →
  correct error code emitted; rejects with unknown error → `INTERNAL_ERROR` emitted

---

## 5. Shared Dummy Data

Always prefer `dummyUsers`, `dummyConversation`, `dummyMessage`, and `dummyDate`
from `~/dummies` over inventing inline values. This keeps assertions readable and
avoids accidental coupling to test-local UUIDs.

For UUID assertions use the shared matcher pattern:

```typescript
const uuidMatcher = expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
```

---

## 6. Running Tests

```bash
pnpm test                                               # all tests
pnpm test -- src/domain/conversation/__tests__/my.spec.ts  # single file
pnpm test:watch                                         # watch mode during TDD
```

Watch mode is the natural companion to TDD — start it before writing the first
test and keep it running throughout the red/green/refactor cycle.

---

## 7. TDD Workflow Summary

1. **Read** the task and identify the layer.
2. **Write the spec file** with failing tests (all three categories above).
3. Run `pnpm test -- <file>` and confirm tests fail for the right reason (not
   import errors or typos — real assertion failures).
4. **Write the implementation** — only what is needed to pass the tests.
5. Run tests again — confirm green.
6. **Refactor** — simplify without breaking tests.
7. If the new code affects other layers (e.g., a new use case needs a new gateway
   event), repeat from step 2 for that layer.
