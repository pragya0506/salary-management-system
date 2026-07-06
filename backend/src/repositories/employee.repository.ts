import { PrismaClient, EmployeeStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface EmployeeFilters {
  department?: string;
  country?: string;
  status?: EmployeeStatus;
  minSalary?: number;
  maxSalary?: number;
  search?: string;
  cursor?: string;
  limit?: number;
}

export const employeeRepository = {
  async findMany(filters: EmployeeFilters) {
    const {
      department, country, status,
      minSalary, maxSalary, search,
      cursor, limit = 20
    } = filters;

    const where: any = {};

    if (department) where.department = department;
    if (country) where.country = country;
    if (status) where.status = status;
    if (minSalary || maxSalary) {
      where.baseSalary = {};
      if (minSalary) where.baseSalary.gte = minSalary;
      if (maxSalary) where.baseSalary.lte = maxSalary;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { employeeId: { contains: search } }
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' }
    });

    const hasMore = employees.length > limit;
    const data = hasMore ? employees.slice(0, -1) : employees;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor, hasMore };
  },

  async findById(id: string) {
    return prisma.employee.findUnique({ where: { id } });
  },

  async create(data: any) {
    return prisma.employee.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.employee.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.employee.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });
  },

  async count(where: any = {}) {
    return prisma.employee.count({ where });
  }
};