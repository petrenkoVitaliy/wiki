import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import { PrismaService } from './prisma.service';

jest.mock('./prisma.service', () => ({
  __esModule: true,
  PrismaService: mockDeep<PrismaService>(),
}));

beforeEach(() => {
  mockReset(PrismaMock);
});

export const PrismaMock =
  PrismaService as unknown as DeepMockProxy<PrismaService>;
