import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const departments = [
  'Engineering', 'Sales', 'HR',
  'Finance', 'Marketing', 'Operations', 'Legal'
];

const countries = ['US', 'UK', 'India', 'Germany', 'France', 'Canada', 'Australia'];

const currencies: Record<string, string> = {
  US: 'USD', UK: 'GBP', India: 'INR',
  Germany: 'EUR', France: 'EUR',
  Canada: 'CAD', Australia: 'AUD'
};

const salaryRanges: Record<string, [number, number]> = {
  US: [60000, 200000],
  UK: [40000, 150000],
  India: [800000, 4000000],
  Germany: [50000, 160000],
  France: [45000, 140000],
  Canada: [55000, 170000],
  Australia: [65000, 180000]
};

async function main() {
  console.log('Seeding 10,000 employees...');

  // Clear existing data first
  await prisma.employee.deleteMany();

  const BATCH_SIZE = 500;
  const TOTAL = 10000;

  for (let batch = 0; batch < TOTAL / BATCH_SIZE; batch++) {
    const employees = Array.from({ length: BATCH_SIZE }, (_, i) => {
      const country = faker.helpers.arrayElement(countries);
      const [min, max] = salaryRanges[country];
      const index = batch * BATCH_SIZE + i + 1;

      return {
        employeeId: `ACME-${String(index).padStart(5, '0')}`,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: `employee${index}@acme.com`,
        department: faker.helpers.arrayElement(departments),
        country,
        currency: currencies[country],
        baseSalary: faker.number.float({ min, max, fractionDigits: 2 }),
        effectiveDate: faker.date.past({ years: 3 }),
        status: 'ACTIVE' as const
      };
    });

    await prisma.employee.createMany({
      data: employees
    });

    console.log(`Batch ${batch + 1}/20 done`);
  }

  console.log('✅ Seeded 10,000 employees');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());