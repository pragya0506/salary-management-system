import { employeeService } from '../src/services/employee.service';
import { employeeRepository } from '../src/repositories/employee.repository';

jest.mock('../src/repositories/employee.repository');
const mockRepo = employeeRepository as jest.Mocked<typeof employeeRepository>;

const HEADER = 'firstName,lastName,email,department,country,currency,baseSalary,effectiveDate';
const validRow = (email: string) =>
  `Jane,Doe,${email},Engineering,US,USD,90000,2024-01-15`;

describe('employeeService.bulkImport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo.count.mockResolvedValue(0);
    mockRepo.create.mockImplementation(async (data: any) => ({
      id: 'generated', status: 'ACTIVE', createdAt: new Date(),
      updatedAt: new Date(), ...data
    }));
  });

  it('imports all valid rows and generates sequential employee IDs', async () => {
    const csv = [HEADER, validRow('a@acme.com'), validRow('b@acme.com')].join('\n');

    const result = await employeeService.bulkImport(csv);

    expect(result).toMatchObject({ total: 2, imported: 2, failed: 0 });
    expect(result.errors).toHaveLength(0);
    expect(mockRepo.create).toHaveBeenCalledTimes(2);
    expect(mockRepo.create).toHaveBeenNthCalledWith(1, expect.objectContaining({ employeeId: 'ACME-00001' }));
    expect(mockRepo.create).toHaveBeenNthCalledWith(2, expect.objectContaining({ employeeId: 'ACME-00002' }));
  });

  it('starts the ID sequence after the existing employee count', async () => {
    mockRepo.count.mockResolvedValue(10000);
    const csv = [HEADER, validRow('new@acme.com')].join('\n');

    await employeeService.bulkImport(csv);

    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ employeeId: 'ACME-10001' }));
  });

  it('reports per-row validation errors without blocking valid rows', async () => {
    const csv = [
      HEADER,
      validRow('good@acme.com'),
      'Bad,Row,not-an-email,Legal,US,USD,-100,not-a-date'
    ].join('\n');

    const result = await employeeService.bulkImport(csv);

    expect(result).toMatchObject({ total: 2, imported: 1, failed: 1 });
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(result.errors[0].row).toBe(2);
    expect(result.errors[0].messages.join(' ')).toMatch(/email/);
    expect(result.errors[0].messages.join(' ')).toMatch(/baseSalary/);
  });

  it('captures duplicate-email database errors per row', async () => {
    mockRepo.create.mockRejectedValueOnce({ code: 'P2002' });
    const csv = [HEADER, validRow('dupe@acme.com')].join('\n');

    const result = await employeeService.bulkImport(csv);

    expect(result).toMatchObject({ total: 1, imported: 0, failed: 1 });
    expect(result.errors[0].messages[0]).toMatch(/duplicate/);
  });

  it('throws a 400-mapped error when the CSV cannot be parsed', async () => {
    // Unclosed quote makes the parser throw.
    const csv = `${HEADER}\n"unterminated,cell,,,,,,`;

    await expect(employeeService.bulkImport(csv)).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('employeeService input validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo.count.mockResolvedValue(0);
    mockRepo.create.mockResolvedValue({} as any);
  });

  it('rejects create with an invalid email before touching the repository', async () => {
    await expect(
      employeeService.createEmployee({
        firstName: 'A', lastName: 'B', email: 'nope',
        department: 'HR', country: 'US', currency: 'USD',
        baseSalary: 50000, effectiveDate: '2024-01-01'
      })
    ).rejects.toThrow();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('rejects create with a non-positive salary', async () => {
    await expect(
      employeeService.createEmployee({
        firstName: 'A', lastName: 'B', email: 'a@acme.com',
        department: 'HR', country: 'US', currency: 'USD',
        baseSalary: 0, effectiveDate: '2024-01-01'
      })
    ).rejects.toThrow();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
