import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '../services/api'
import { DEPARTMENTS, COUNTRIES, CURRENCY_BY_COUNTRY } from '../lib/constants'
import Modal from './Modal'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  country: string
  currency: string
  baseSalary: number
  effectiveDate: string
  status: 'ACTIVE' | 'INACTIVE'
}

interface Props {
  open: boolean
  onClose: () => void
  employee: Employee | null // null => create mode
}

const empty = {
  firstName: '', lastName: '', email: '',
  department: 'Engineering', country: 'US', currency: 'USD',
  baseSalary: '', effectiveDate: '', status: 'ACTIVE'
}

const labelCls = 'mb-1 block text-sm font-semibold text-slate-700'
const fieldCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function EmployeeFormModal({ open, onClose, employee }: Props) {
  const qc = useQueryClient()
  const isEdit = Boolean(employee)
  const [form, setForm] = useState<any>(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset the form whenever the modal opens or the target employee changes.
  useEffect(() => {
    if (!open) return
    setErrors({})
    if (employee) {
      setForm({
        ...employee,
        baseSalary: String(employee.baseSalary),
        effectiveDate: employee.effectiveDate.slice(0, 10)
      })
    } else {
      setForm(empty)
    }
  }, [open, employee])

  const set = (key: string, value: string) => {
    setForm((f: any) => {
      const next = { ...f, [key]: value }
      // Auto-fill currency from country unless the user is editing currency.
      if (key === 'country') next.currency = CURRENCY_BY_COUNTRY[value] ?? f.currency
      return next
    })
  }

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit ? employeeApi.update(employee!.id, payload) : employeeApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
      qc.invalidateQueries({ queryKey: ['byDepartment'] })
      qc.invalidateQueries({ queryKey: ['byCountry'] })
      onClose()
    },
    onError: (err: any) => {
      // Surface backend field-level validation errors next to inputs.
      const details = err?.response?.data?.details
      if (Array.isArray(details)) {
        const fieldErrors: Record<string, string> = {}
        details.forEach((d: any) => { fieldErrors[d.field] = d.message })
        setErrors(fieldErrors)
      } else {
        setErrors({ _form: err?.response?.data?.error ?? 'Something went wrong' })
      }
    }
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    mutation.mutate({
      ...form,
      baseSalary: form.baseSalary === '' ? undefined : Number(form.baseSalary)
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Employee' : 'Add Employee'}>
      <form onSubmit={submit} className="space-y-4">
        {errors._form && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors._form}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelCls}>First name</label>
            <input id="firstName" className={fieldCls} value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className={labelCls}>Last name</label>
            <input id="lastName" className={fieldCls} value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>Email</label>
          <input id="email" className={fieldCls} value={form.email} onChange={e => set('email', e.target.value)} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="department" className={labelCls}>Department</label>
            <select id="department" className={fieldCls} value={form.department} onChange={e => set('department', e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="country" className={labelCls}>Country</label>
            <select id="country" className={fieldCls} value={form.country} onChange={e => set('country', e.target.value)}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="baseSalary" className={labelCls}>Base salary ({form.currency})</label>
            <input id="baseSalary" type="number" className={fieldCls} value={form.baseSalary} onChange={e => set('baseSalary', e.target.value)} />
            {errors.baseSalary && <p className="mt-1 text-xs text-red-600">{errors.baseSalary}</p>}
          </div>
          <div>
            <label htmlFor="effectiveDate" className={labelCls}>Effective date</label>
            <input id="effectiveDate" type="date" className={fieldCls} value={form.effectiveDate} onChange={e => set('effectiveDate', e.target.value)} />
            {errors.effectiveDate && <p className="mt-1 text-xs text-red-600">{errors.effectiveDate}</p>}
          </div>
        </div>

        {isEdit && (
          <div>
            <label htmlFor="status" className={labelCls}>Status</label>
            <select id="status" className={fieldCls} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
