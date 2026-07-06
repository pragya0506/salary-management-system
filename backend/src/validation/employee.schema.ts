import { z } from 'zod';

// Single source of truth for what a valid employee payload looks like.
// Reused by the create/update endpoints and the CSV importer so the
// same rules apply everywhere.
export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, 'firstName is required'),
  lastName: z.string().trim().min(1, 'lastName is required'),
  email: z.string().trim().email('email must be a valid email address'),
  department: z.string().trim().min(1, 'department is required'),
  country: z.string().trim().min(1, 'country is required'),
  currency: z.string().trim().min(1, 'currency is required'),
  baseSalary: z.coerce
    .number({ message: 'baseSalary must be a number' })
    .positive('baseSalary must be greater than 0'),
  effectiveDate: z.coerce.date({ message: 'effectiveDate must be a valid date' }),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

// Update allows partial payloads — every field is optional but still
// validated when present.
export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
