export interface UseCase<TInput, TOutput = void> {
  execute(input: TInput): Promise<TOutput>;
}
