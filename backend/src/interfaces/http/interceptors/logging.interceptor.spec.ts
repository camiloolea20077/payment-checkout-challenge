import { CallHandler, ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  const interceptor = new LoggingInterceptor();

  it('deja pasar la respuesta del handler', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/api/v1/health' }),
      }),
    } as unknown as ExecutionContext;
    const next: CallHandler = { handle: () => of('ok') };

    const result$ = interceptor.intercept(context, next);
    await expect(firstValueFrom(result$)).resolves.toBe('ok');
  });
});
