import { InputPort } from '@/transport/ports';
import { Injectable, Logger, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

type ClassConstructor<T> = new (...args: unknown[]) => T;

@Injectable()
export class InputPortPipe<T extends object> implements PipeTransform {
  private readonly logger = new Logger(InputPortPipe.name);

  constructor(private readonly dto: ClassConstructor<T>) {}

  async transform(value: unknown): Promise<InputPort<T>> {
    const data = plainToInstance(this.dto, value);
    try {
      await validateOrReject(data, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
    } catch (errors) {
      this.logger.warn('validation failed', JSON.stringify({ dto: this.dto.name }));
      throw errors;
    }
    return { data, timestamp: new Date() };
  }
}
