import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const analyticsService = {
  async getSummary() {
    const [totalActive, avgResult] = await Promise.all([
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.aggregate({
        _avg: { baseSalary: true },
        _min: { baseSalary: true },
        _max: { baseSalary: true },
        where: { status: 'ACTIVE' }
      })
    ]);

    return {
      totalEmployees: totalActive,
      averageSalary: avgResult._avg.baseSalary,
      minSalary: avgResult._min.baseSalary,
      maxSalary: avgResult._max.baseSalary
    };
  },

  async getByDepartment() {
    return prisma.employee.groupBy({
      by: ['department'],
      where: { status: 'ACTIVE' },
      _avg: { baseSalary: true },
      _count: { id: true },
      _min: { baseSalary: true },
      _max: { baseSalary: true },
      orderBy: { _avg: { baseSalary: 'desc' } }
    });
  },

  async getByCountry() {
    return prisma.employee.groupBy({
      by: ['country', 'currency'],
      where: { status: 'ACTIVE' },
      _avg: { baseSalary: true },
      _count: { id: true },
      orderBy: { _avg: { baseSalary: 'desc' } }
    });
  }
};