# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start:dev        # dev server with hot-reload
pnpm build            # compile TypeScript via NestJS CLI
pnpm type-check       # tsc without emitting (CI type check)
pnpm lint             # ESLint with auto-fix
pnpm test             # run all unit tests
pnpm test:watch       # watch mode
```

To run a single test file:

```bash
pnpm test -- src/domain/conversation/usecases/connect.usecase.spec.ts
```

Use `pnpm` exclusively — the engines field rejects npm/yarn.

## Architecture

The codebase follows a strict three-layer clean architecture:

```
src/
  domain/       # Pure business logic — UseCases, domain interfaces, DTOs
  datasource/   # Data access — Redis client wrapper (RedisDatasource)
  transport/    # Delivery layer — WebSocket gateways, pipes, filters, decorators
```

**Dependency direction:** `transport` → `domain` → `datasource`. Domain never imports from transport or datasource directly; datasource is injected via NestJS DI.

**UseCase pattern:** All operations implement `UseCase<TInput, TOutput>` from `src/domain/interfaces.ts`. Each use case is a single injectable class with one `execute()` method. Adding a feature means adding a new use case, wiring it in the module, and calling it from the gateway — not modifying existing use cases.

**InputPort pattern:** Every WebSocket event payload is wrapped as `InputPort<T> = { data: T, timestamp: Date }` by `InputPortPipe` before reaching the handler. The custom `@WsBody()` decorator triggers this pipe, which runs `class-validator` validation and rejects with `WsException` if invalid.

**WebSocket flow:**

1. Client connects with `{ nickname, conversationId? }` in `socket.handshake.auth`
2. `AppGateway.handleConnection` calls `ConnectConversationUseCase` → joins/creates a Redis-backed conversation → stores `{ userId, nickname, conversationId }` in `client.data`
3. Messages go through `ConversationGateway` (`conversation:message` event), validated by pipe, forwarded via `SendMessageUseCase`
4. Leave via `conversation:leave` event or disconnect triggers `LeaveConversationUseCase`, which erases the conversation from Redis if the last user leaves

**Redis data model:**

- Conversation details: key `details-{conversationId}` → JSON object with user list
- Messages: key `conversationId` → Redis list of JSON message objects

**Config (`src/config/`):** Environment is loaded once via `ConfigModule.forRoot()` in `AppModule`. `src/config/redis.ts` uses `registerAs('redis', ...)` to namespace Redis config and builds the connection URL from individual env vars (`REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`). `src/config/index.ts` aggregates all config factories and is the only file imported by `AppModule`. Add new config namespaces here — never read `process.env` directly outside of a config factory.

## Safety & Anonymity

This is an anonymous chat service. Several constraints must be preserved:

- **User IDs are server-side only.** UUIDs are generated in `ConnectConversationUseCase` and stored in `client.data`, but never emitted to clients. Only `nickname` is broadcast. Do not add user ID to any outbound event payload.
- **No authentication persistence.** There are no sessions, tokens, or persistent user records. Every connection is stateless beyond the Redis conversation lifetime.
- **Conversation isolation.** Users only receive events from their Socket.IO room (`conversationId`). Never broadcast outside a room or emit to all connected sockets.
- **Input validation is mandatory.** All inbound event payloads must go through `InputPortPipe` + `class-validator`. Skipping validation is a security boundary violation, not just a quality issue.
- **Nickname is the only identity.** There is no uniqueness constraint on nicknames by design — enforcing uniqueness would reduce anonymity.
- **Conversation cleanup.** When the last user leaves, `LeaveConversationUseCase` erases the conversation from Redis. Leaving any conversation data orphaned is a data-hygiene and privacy issue.

## Error Handling

All WebSocket errors are handled by `WsExceptionFilter` (`src/transport/filters/ws-exception.filter.ts`), which is applied globally via `@UseFilters` on the gateways. It maps exception types to `ErrorCode` values and emits an `error` event: `{ code: ErrorCode, message: string }`.

Error codes live in `src/transport/errors/codes.ts`:

- `INVALID_AUTH` — missing/invalid handshake auth (triggers disconnect)
- `NOT_IN_ROOM` — event from a client not in a conversation room
- `VALIDATION_ERROR` — `WsException` or failed class-validator pipe
- `INTERNAL_ERROR` — unexpected errors from Redis or internal logic

Domain errors use `ConversationError` (extends `Error` with a `code` field). Throw `ConversationError` with the appropriate `ErrorCode` when a domain rule is violated. For unexpected errors from external systems (Redis), catch and re-throw as `ConversationError(ErrorCode.INTERNAL_ERROR, ...)`. Disconnect cleanup errors (in `handleDisconnect`) should be caught, logged, and swallowed — never re-thrown, as the client is already disconnecting.

## TDD

Tests live alongside source files as `*.spec.ts`. The `__mocks__/` directory at the root provides Jest automatic mocks:

- `__mocks__/ioredis.ts` — in-memory Map-based Redis mock; all ioredis imports resolve to this automatically
- `__mocks__/socket.io.ts` — mock `AppSocket` with a Set-based rooms implementation

The testing approach is unit-first: inject mock collaborators (datasource, use cases) and test the use case or gateway in isolation. For `RedisDatasource`, mock at the `ioredis` level (automatic mock). For gateways, mock the use cases.

**Test file structure:** Spec files are split by method/functionality — each public method gets its own `*.spec.ts` file rather than one omnibus file per class. For example, a use case with `execute()` and `validate()` would have `execute.spec.ts` and `validate.spec.ts` as siblings to the source file.

When adding a new use case, the spec should cover:

1. The happy path with mocked Redis responses
2. Redis failure → `ConversationError(INTERNAL_ERROR, ...)`
3. Any domain rule violations → appropriate `ConversationError`

## Observability

Structured logging is mandatory in every class that does meaningful work. Use NestJS `Logger` — never `console.log`.

**Setup:** every injectable class must declare:

```typescript
private readonly logger = new Logger(ClassName.name);
```

**Log levels:**

- `logger.log` — normal flow milestones (operation started, resource found, cleanup complete)
- `logger.warn` — expected-but-notable situations (not found, skipped cleanup, client rejected)
- `logger.error` — failures from Redis, unhandled exceptions, or anything that breaks the happy path

**Context format:** always pass a second argument to the logger with `JSON.stringify({ ...relevantFields })`. Include identifiers that aid debugging (`socketId`, `conversationId`, `nickname`, `error.message`). Never include raw Error objects or user message content.

```typescript
this.logger.log('execute: starting', JSON.stringify({ nickname, conversationId }));
this.logger.error('execute: Redis error', JSON.stringify({ conversationId, error: (error as Error).message }));
```

**Coverage requirement:** log at the entry point of every public method and at each significant branch (resource found vs. not found, last user vs. not, success vs. failure). A new use case, gateway method, or datasource method that lacks this coverage is incomplete.

## Keeping This File Current

This file must always reflect the current state of the project. Whenever a structural or architectural decision changes — new conventions, new layers, renamed patterns, updated error codes, etc. — update the relevant section here as part of the same task. Do not defer CLAUDE.md updates to a separate step.
