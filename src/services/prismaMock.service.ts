import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import { PrismaService } from './prisma.service';

beforeEach(() => {
  mockReset(PrismaMock);
});

export const PrismaMock = mockDeep<PrismaService>() as unknown as DeepMockProxy<PrismaService>;
