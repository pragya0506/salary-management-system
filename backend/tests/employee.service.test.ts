import { employeeService } from '../src/services/employee.service';
import { employeeRepository } from '../src/repositories/employee.repository';

// Mock the repository
jest.mock('../src/repositories/employee.repository');

const mockRepo = employeeRepository as jest.Mocked<typeof employeeRepository>;

describe('EmployeeService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getEmployees', () => {
    it('should return paginated employees', async () => {
      mockRepo.findMany.mockResolvedValue({
        data: [
          {
            id: '1',
            employeeId: 'ACME-00001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@acme.com',
            department: 'Engineering',
            country: 'US',
            currency: 'USD',
            baseSalary: 90000,
            effectiveDate: new Date(),
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        nextCursor: null,
        hasMore: false
      });

      const result = await employeeService.getEmployees({});

      expect(result.data).toHaveLength(1);
      expect(result.hasMore).toBe(false);
      expect(mockRepo.findMany).toHaveBeenCalledWith({});
    });

    it('should pass filters to repository', async () => {
      mockRepo.findMany.mockResolvedValue({
        data: [], nextCursor: null, hasMore: false
      });

      await employeeService.getEmployees({
        department: 'Engineering',
        country: 'US'
      });

      expect(mockRepo.findMany).toHaveBeenCalledWith({
        department: 'Engineering',
        country: 'US'
      });
    });

    it('should return empty when no employees match filters', async () => {
      mockRepo.findMany.mockResolvedValue({
        data: [], nextCursor: null, hasMore: false
      });

      const result = await employeeService.getEmployees({
        department: 'NonExistent'
      });

      expect(result.data).toHaveLength(0);
    });
  });

  describe('getEmployeeById', () => {
    it('should return employee when found', async () => {
      const mockEmployee = {
        id: '1',
        employeeId: 'ACME-00001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@acme.com',
        department: 'Engineering',
        country: 'US',
        currency: 'USD',
        baseSalary: 90000,
        effectiveDate: new Date(),
        status: 'ACTIVE' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRepo.findById.mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployeeById('1');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw when employee not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        employeeService.getEmployeeById('nonexistent')
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('createEmployee', () => {
    it('should create employee with generated employeeId', async () => {
      mockRepo.count.mockResolvedValue(5);
      mockRepo.create.mockResolvedValue({
        id: '2',
        employeeId: 'ACME-00006',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@acme.com',
        department: 'HR',
        country: 'UK',
        currency: 'GBP',
        baseSalary: 70000,
        effectiveDate: new Date(),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await employeeService.createEmployee({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@acme.com',
        department: 'HR',
        country: 'UK',
        currency: 'GBP',
        baseSalary: 70000,
        effectiveDate: new Date()
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ employeeId: 'ACME-00006' })
      );
      expect(result.employeeId).toBe('ACME-00006');
    });
  });

  describe('updateEmployee', () => {
    it('should update employee when found', async () => {
      const existing = {
        id: '1', employeeId: 'ACME-00001',
        firstName: 'John', lastName: 'Doe',
        email: 'john@acme.com', department: 'Engineering',
        country: 'US', currency: 'USD', baseSalary: 90000,
        effectiveDate: new Date(), status: 'ACTIVE' as const,
        createdAt: new Date(), updatedAt: new Date()
      };

      mockRepo.findById.mockResolvedValue(existing);
      mockRepo.update.mockResolvedValue({
        ...existing, baseSalary: 100000
      });

      const result = await employeeService.updateEmployee('1', {
        baseSalary: 100000
      });

      expect(result.baseSalary).toBe(100000);
    });

    it('should throw when updating nonexistent employee', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        employeeService.updateEmployee('nonexistent', { baseSalary: 100000 })
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('deactivateEmployee', () => {
    it('should set status to INACTIVE', async () => {
      const existing = {
        id: '1', employeeId: 'ACME-00001',
        firstName: 'John', lastName: 'Doe',
        email: 'john@acme.com', department: 'Engineering',
        country: 'US', currency: 'USD', baseSalary: 90000,
        effectiveDate: new Date(), status: 'ACTIVE' as const,
        createdAt: new Date(), updatedAt: new Date()
      };

      mockRepo.findById.mockResolvedValue(existing);
      mockRepo.softDelete.mockResolvedValue({
        ...existing, status: 'INACTIVE'
      });

      await employeeService.deactivateEmployee('1');

      expect(mockRepo.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw when deactivating nonexistent employee', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        employeeService.deactivateEmployee('nonexistent')
      ).rejects.toThrow('Employee not found');
    });
  });
});