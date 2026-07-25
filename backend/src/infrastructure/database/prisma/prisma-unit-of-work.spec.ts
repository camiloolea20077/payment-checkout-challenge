import { PrismaService } from './prisma.service';
import { PrismaUnitOfWork } from './prisma-unit-of-work';

describe('PrismaUnitOfWork', () => {
  it('delega en PrismaService.runInTransaction', async () => {
    const runInTransaction = jest.fn((work: () => Promise<unknown>) => work());
    const prisma = { runInTransaction } as unknown as PrismaService;
    const uow = new PrismaUnitOfWork(prisma);

    const result = await uow.runInTransaction(() => Promise.resolve('done'));

    expect(result).toBe('done');
    expect(runInTransaction).toHaveBeenCalledTimes(1);
  });
});
