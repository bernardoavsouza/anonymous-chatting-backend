import { InputPort } from '@/transport/ports';
import { Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

type ClassConstructor<T> = new (...args: unknown[]) => T;

@Injectable()
export class InputPortPipe<T extends object> implements PipeTransform {
  constructor(private readonly dto: ClassConstructor<T>) {}

  async transform(value: unknown): Promise<InputPort<T>> {
    const data = plainToInstance(this.dto, value);
    await validateOrReject(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    return { data, timestamp: new Date() };
  }
}
