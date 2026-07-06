import { Request, Response } from 'express';
import { employeeService } from '../services/employee.service';
import { ValidationError } from '../errors';

export const employeeController = {
  async getAll(req: Request, res: Response) {
    const {
      department, country, status,
      minSalary, maxSalary, search,
      cursor, limit
    } = req.query;

    const result = await employeeService.getEmployees({
      department: department as string,
      country: country as string,
      status: status as any,
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
      search: search as string,
      cursor: cursor as string,
      limit: limit ? Number(limit) : 20
    });

    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const id = req.params['id'] as string;
    const employee = await employeeService.getEmployeeById(id);
    res.json(employee);
  },

  async create(req: Request, res: Response) {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json(employee);
  },

  async update(req: Request, res: Response) {
    const id = req.params['id'] as string;
    const employee = await employeeService.updateEmployee(id, req.body);
    res.json(employee);
  },

  async deactivate(req: Request, res: Response) {
    const id = req.params['id'] as string;
    await employeeService.deactivateEmployee(id);
    res.status(204).send();
  },

  async bulkImport(req: Request, res: Response) {
    const { csv } = req.body;
    if (typeof csv !== 'string' || csv.trim() === '') {
      throw new ValidationError('Request body must include a non-empty "csv" string');
    }
    const result = await employeeService.bulkImport(csv);
    res.status(result.failed > 0 ? 207 : 201).json(result);
  }
};