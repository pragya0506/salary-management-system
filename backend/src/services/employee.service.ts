import { parse } from 'csv-parse/sync';
import { employeeRepository, EmployeeFilters } from '../repositories/employee.repository';
import { createEmployeeSchema, updateEmployeeSchema } from '../validation/employee.schema';
import { NotFoundError, ValidationError } from '../errors';

// ACME-00001 style, zero-padded to 5 digits.
const formatEmployeeId = (n: number) => `ACME-${String(n).padStart(5, '0')}`;

export interface ImportRowError {
  row: number; // 1-based data row (header excluded)
  messages: string[];
}

export interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: ImportRowError[];
}

export const employeeService = {
  async getEmployees(filters: EmployeeFilters) {
    return employeeRepository.findMany(filters);
  },

  async getEmployeeById(id: string) {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw new NotFoundError('Employee not found');
    return employee;
  },

  async createEmployee(data: unknown) {
    const parsed = createEmployeeSchema.parse(data);
    const count = await employeeRepository.count();
    const employeeId = formatEmployeeId(count + 1);
    return employeeRepository.create({ ...parsed, employeeId });
  },

  async updateEmployee(id: string, data: unknown) {
    const parsed = updateEmployeeSchema.parse(data);
    await this.getEmployeeById(id); // throws NotFoundError if missing
    return employeeRepository.update(id, parsed);
  },

  async deactivateEmployee(id: string) {
    await this.getEmployeeById(id);
    return employeeRepository.softDelete(id);
  },

  // Parse a CSV string, validate each row, and insert the valid ones.
  // Returns a per-row error report so the HR manager can fix and re-upload,
  // mirroring the Excel workflow it replaces. Valid rows are still imported
  // even when others fail (partial success).
  async bulkImport(csvText: string): Promise<ImportResult> {
    let records: Record<string, string>[];
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch {
      throw new ValidationError('CSV could not be parsed');
    }

    const errors: ImportRowError[] = [];
    let imported = 0;

    // Reserve a starting sequence number once so bulk-generated IDs don't
    // all collide on count+1.
    let nextNum = (await employeeRepository.count()) + 1;

    for (let i = 0; i < records.length; i++) {
      const rowNumber = i + 1;
      const result = createEmployeeSchema.safeParse(records[i]);

      if (!result.success) {
        errors.push({
          row: rowNumber,
          messages: result.error.issues.map(is => `${is.path.join('.')}: ${is.message}`)
        });
        continue;
      }

      try {
        await employeeRepository.create({
          ...result.data,
          employeeId: formatEmployeeId(nextNum)
        });
        nextNum++;
        imported++;
      } catch (e: any) {
        // Most common: duplicate email (unique constraint).
        const msg = e?.code === 'P2002' ? 'duplicate email or employeeId' : 'database error';
        errors.push({ row: rowNumber, messages: [msg] });
      }
    }

    return {
      total: records.length,
      imported,
      failed: errors.length,
      errors
    };
  }
};
