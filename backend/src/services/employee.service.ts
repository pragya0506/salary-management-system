import { employeeRepository, EmployeeFilters } from '../repositories/employee.repository';

export const employeeService = {
  async getEmployees(filters: EmployeeFilters) {
    return employeeRepository.findMany(filters);
  },

  async getEmployeeById(id: string) {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw new Error('Employee not found');
    return employee;
  },

  async createEmployee(data: any) {
    // generate employeeId
    const count = await employeeRepository.count();
    const employeeId = `ACME-${String(count + 1).padStart(5, '0')}`;
    return employeeRepository.create({ ...data, employeeId });
  },

  async updateEmployee(id: string, data: any) {
    await this.getEmployeeById(id); // throws if not found
    return employeeRepository.update(id, data);
  },

  async deactivateEmployee(id: string) {
    await this.getEmployeeById(id);
    return employeeRepository.softDelete(id);
  }
};