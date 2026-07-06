import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '../services/api'
import Modal from './Modal'

interface Props {
  open: boolean
  onClose: () => void
}

interface ImportResult {
  total: number
  imported: number
  failed: number
  errors: { row: number; messages: string[] }[]
}

const COLUMNS = 'firstName, lastName, email, department, country, currency, baseSalary, effectiveDate'

export default function ImportModal({ open, onClose }: Props) {
  const qc = useQueryClient()
  const [fileName, setFileName] = useState('')
  const [csv, setCsv] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)

  const mutation = useMutation({
    mutationFn: (text: string) => employeeApi.bulkImport(text).then(r => r.data as ImportResult),
    onSuccess: (data) => {
      setResult(data)
      qc.invalidateQueries({ queryKey: ['employees'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
      qc.invalidateQueries({ queryKey: ['byDepartment'] })
      qc.invalidateQueries({ queryKey: ['byCountry'] })
    }
  })

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    file.text().then(setCsv)
  }

  const close = () => {
    setFileName(''); setCsv(''); setResult(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={close} title="Import Employees from CSV">
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">Expected columns (with header row):</p>
          <p className="mt-1 font-mono">{COLUMNS}</p>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40">
          <span className="text-3xl">📄</span>
          <span className="mt-2 text-sm font-semibold text-slate-700">
            {fileName || 'Choose a CSV file'}
          </span>
          <span className="text-xs text-slate-400">Click to browse</span>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
        </label>

        {result && (
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex gap-6 text-sm">
              <span className="font-semibold text-emerald-600">{result.imported} imported</span>
              {result.failed > 0 && <span className="font-semibold text-red-600">{result.failed} failed</span>}
              <span className="text-slate-400">{result.total} total</span>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs">
                {result.errors.map(err => (
                  <div key={err.row} className="text-red-600">
                    <span className="font-semibold">Row {err.row}:</span> {err.messages.join('; ')}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={close} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            {result ? 'Done' : 'Cancel'}
          </button>
          <button
            onClick={() => mutation.mutate(csv)}
            disabled={!csv || mutation.isPending}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
