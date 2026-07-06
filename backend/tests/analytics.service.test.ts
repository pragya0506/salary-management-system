import { analyticsService } from '../src/services/analytics.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    employee: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn()
    }
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const prisma = new PrismaClient() as any;

describe('AnalyticsService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getSummary', () => {
    it('should return total employees and salary stats', async () => {
      prisma.employee.count.mockResolvedValue(10000);
      prisma.employee.aggregate.mockResolvedValue({
        _avg: { baseSalary: 85000 },
        _min: { baseSalary: 30000 },
        _max: { baseSalary: 200000 }
      });

      const result = await analyticsService.getSummary();

      expect(result.totalEmployees).toBe(10000);
      expect(result.averageSalary).toBe(85000);
      expect(result.minSalary).toBe(30000);
      expect(result.maxSalary).toBe(200000);
    });
  });

  describe('getByDepartment', () => {
    it('should return salary stats grouped by department', async () => {
      prisma.employee.groupBy.mockResolvedValue([
        {
          department: 'Engineering',
          _avg: { baseSalary: 120000 },
          _count: { id: 3000 },
          _min: { baseSalary: 60000 },
          _max: { baseSalary: 200000 }
        },
        {
          department: 'HR',
          _avg: { baseSalary: 70000 },
          _count: { id: 500 },
          _min: { baseSalary: 40000 },
          _max: { baseSalary: 100000 }
        }
      ]);

      const result = await analyticsService.getByDepartment();

      expect(result).toHaveLength(2);
      expect(result[0].department).toBe('Engineering');
      expect(result[0]._avg.baseSalary).toBe(120000);
    });
  });

  describe('getByCountry', () => {
    it('should return salary stats grouped by country', async () => {
      prisma.employee.groupBy.mockResolvedValue([
        {
          country: 'US',
          currency: 'USD',
          _avg: { baseSalary: 110000 },
          _count: { id: 4000 }
        }
      ]);

      const result = await analyticsService.getByCountry();

      expect(result[0].country).toBe('US');
      expect(result[0].currency).toBe('USD');
    });
  });
});