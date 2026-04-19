import { useState, useEffect } from 'react'
import { saleService } from '../../services/saleService'

const periods = [
  { value: 'day',   label: 'Hoje' },
  { value: 'week',  label: 'Últimos 7 dias' },
  { value: 'month', label: 'Este mês' },
]

export default function HistoryPage() {
  const [period, setPeriod]   = useState('day')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [period])

  async function load() {
    try {
      setLoading(true)
      setHistory(await saleService.getHistory(period))
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = history.reduce((sum, h) => sum + Number(h.totalRevenue), 0)
  const totalOrders  = history.reduce((sum, h) => sum + Number(h.totalOrders), 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-800">Histórico de vendas</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Acompanhe o desempenho do delivery</p>
      </div>

      <div className="flex gap-2 mb-6">
        {periods.map(p => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${period === p.value
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-sm text-zinc-500">Total de pedidos</p>
          <p className="text-3xl font-semibold text-zinc-800 mt-1">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-sm text-zinc-500">Receita total</p>
          <p className="text-3xl font-semibold text-orange-500 mt-1">
            R$ {totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-400 text-sm">Carregando...</div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-12 text-center text-zinc-400 text-sm">
          Nenhuma venda registrada neste período
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Data</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Pedidos</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Receita</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}
                  className={`border-b border-zinc-50 hover:bg-zinc-50 transition-colors
                    ${i === history.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 text-zinc-700">
                    {new Date(h.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{h.totalOrders}</td>
                  <td className="px-4 py-3 font-medium text-zinc-700">
                    R$ {Number(h.totalRevenue).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}