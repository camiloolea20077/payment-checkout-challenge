import { ArgumentsHost, HttpStatus, NotFoundException } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

const buildHost = () => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const response = { status };
  const request = { url: '/api/v1/test', method: 'GET' };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
};

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('mapea una HttpException a su estado y mensaje', () => {
    const { host, status, json } = buildHost();
    filter.catch(new NotFoundException('no existe'), host);
    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: 'no existe' }),
    );
  });

  it('un error inesperado devuelve 500 con mensaje genérico', () => {
    const { host, status, json } = buildHost();
    filter.catch(new Error('detalle interno'), host);
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Error interno del servidor',
      }),
    );
  });
});
