import { useImportQueue } from '../hooks/useImportQueue'

export function ImportPage() {
  const { rows, loading, error } = useImportQueue()

  return (
    <>
      <section className="card px-6 py-5">
        <h2 className="text-2xl font-semibold">Import Resources</h2>
        <p className="mt-2 text-sm text-slate-500">
          Discover unmanaged Azure resources and bring them under Bicep control.
        </p>
      </section>

      {error ? <div className="card px-5 py-4 text-sm text-rose-600">{error}</div> : null}

      <section className="card px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Unmanaged Inventory</h3>
            <p className="text-sm text-slate-500">Latest ARM scan across dev and prod subscriptions.</p>
          </div>
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            Run New Scan
          </button>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em]">Resource</th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em]">Type</th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em]">Status</th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(loading ? Array.from({ length: 3 }) : rows).map((row, index) => {
                const badgeStyle =
                  row?.state === 'Managed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : row?.state === 'Pending'
                    ? 'bg-amber-100 text-amber-700'
                    : row?.state === 'Drifted'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-blue-100 text-blue-700'
                return (
                  <tr key={row ? row.name : `import-${index}`} className="bg-white">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row ? row.name : 'Loading...'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row ? row.type : ''}</td>
                    <td className="px-4 py-3">
                      {row ? <span className={`badge ${badgeStyle}`}>{row.state}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row ? row.action : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
