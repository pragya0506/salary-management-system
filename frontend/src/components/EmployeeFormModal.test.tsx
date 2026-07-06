import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EmployeeFormModal from './EmployeeFormModal'
import { employeeApi } from '../services/api'

vi.mock('../services/api', () => ({
  employeeApi: {
    create: vi.fn(),
    update: vi.fn()
  }
}))

const renderModal = (props: Partial<Parameters<typeof EmployeeFormModal>[0]> = {}) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <EmployeeFormModal open onClose={() => {}} employee={null} {...props} />
    </QueryClientProvider>
  )
}

describe('EmployeeFormModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the create title and empty fields in add mode', () => {
    renderModal()
    expect(screen.getByText('Add Employee')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add employee' })).toBeInTheDocument()
  })

  it('auto-fills currency from the selected country', async () => {
    const user = userEvent.setup()
    renderModal()
    // Defaults to US / USD
    expect(screen.getByText('Base salary (USD)')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Country'), 'India')
    expect(screen.getByText('Base salary (INR)')).toBeInTheDocument()
  })

  it('submits a numeric baseSalary to the create endpoint', async () => {
    const user = userEvent.setup()
    ;(employeeApi.create as any).mockResolvedValue({ data: {} })
    renderModal()

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Email'), 'jane@acme.com')
    await user.type(screen.getByLabelText('Base salary (USD)'), '90000')
    await user.click(screen.getByRole('button', { name: 'Add employee' }))

    await waitFor(() => expect(employeeApi.create).toHaveBeenCalledTimes(1))
    const payload = (employeeApi.create as any).mock.calls[0][0]
    expect(payload).toMatchObject({ firstName: 'Jane', email: 'jane@acme.com', baseSalary: 90000 })
    expect(typeof payload.baseSalary).toBe('number')
  })

  it('renders backend field-level validation errors next to inputs', async () => {
    const user = userEvent.setup()
    ;(employeeApi.create as any).mockRejectedValue({
      response: { data: { details: [{ field: 'email', message: 'email must be a valid email address' }] } }
    })
    renderModal()

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Email'), 'bad')
    await user.type(screen.getByLabelText('Base salary (USD)'), '90000')
    await user.click(screen.getByRole('button', { name: 'Add employee' }))

    expect(await screen.findByText('email must be a valid email address')).toBeInTheDocument()
  })

  it('shows the edit title and calls update when given an employee', async () => {
    const user = userEvent.setup()
    ;(employeeApi.update as any).mockResolvedValue({ data: {} })
    renderModal({
      employee: {
        id: 'emp-1', firstName: 'John', lastName: 'Roe', email: 'john@acme.com',
        department: 'HR', country: 'UK', currency: 'GBP', baseSalary: 70000,
        effectiveDate: '2024-01-01T00:00:00.000Z', status: 'ACTIVE'
      }
    })

    expect(screen.getByText('Edit Employee')).toBeInTheDocument()
    expect((screen.getByLabelText('First name') as HTMLInputElement).value).toBe('John')

    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(employeeApi.update).toHaveBeenCalledWith('emp-1', expect.any(Object)))
  })
})
