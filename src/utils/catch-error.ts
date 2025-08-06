import { HttpException, InternalServerErrorException } from '@nestjs/common';

export async function catchErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    console.error('Unhandled Error:', error);
    throw new InternalServerErrorException('Something went wrong');
  }
}
