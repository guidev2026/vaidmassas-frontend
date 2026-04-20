import { useState, useEffect } from 'react'
import { saleService } from '../../services/saleService'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  quantity: z.coerce.number().int().positive('Deve ser maior que zero'),
})

const periods = [
  { value: 'day',   label: 'Hoje' },
  { value: 'week',  label: '7 dias' },
  { value: 'month', label: 'Este mês' },
]

export default function HistoryPage() {
  const [period, setPeriod]     = useState('day')
  const [summary, setSummary]   = useState([])
  const [detailed, setDetailed] = useState([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(null)
  const [error, setError]       = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => { load() }, [period])

  async function load() {
    try {
      setLoading(true)
      const [sum, det] = await Promise.all([
        saleService.getHistory(period),
        saleService.getDetailed(period),
      ])
      setSummary(sum)
      setDetailed(det)
    } finally {
      setLoading(false)
    }
  }

  function openEdit(sale) {
    setEditing(sale)
    reset({ quantity: sale.quantity })
    setError('')
  }

  function closeModal() { setEditing(null) }

  async function onSubmit(data) {
    try {
      setError('')
      await saleService.update(editing.id, data)
      await load()
      closeModal()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Deseja remover esta venda? Os insumos serão devolvidos ao estoque.')) return
    await saleService.remove(id)
    await load()
  }

  const totalRevenue = summary.reduce((sum, h) => sum + Number(h.totalRevenue), 0)
  const totalOrders  = summary.reduce((sum, h) => sum + Number(h.totalOrders), 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg md:text-xl font-semibold text-zinc-800">Histórico de vendas</h1>
        <p className="text-xs md:text-sm text-zinc-500 mt-0.5">Acompanhe o desempenho do delivery</p>
      </div>

      <div className="flex gap-2 mb-6">
        {periods.map(p => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${period === p.value
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-4 md:p-5">
          <p className="text-xs md:text-sm text-zinc-500">Total de pedidos</p>
          <p className="text-2xl md:text-3xl font-semibold text-zinc-800 mt-1">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 md:p-5">
          <p className="text-xs md:text-sm text-zinc-500">Receita total</p>
          <p className="text-xl md:text-3xl font-semibold text-orange-500 mt-1">
            R$ {totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-400 text-sm">Carregando...</div>
      ) : detailed.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-12 text-center text-zinc-400 text-sm">
          Nenhuma venda registrada neste período
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Data</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Prato</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Qtd</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Unit.</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {detailed.map((s, i) => (
                  <tr key={s.id}
                    className={`border-b border-zinc-50 hover:bg-zinc-50 ${i === detailed.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(s.saleDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-700">{s.productName}</td>
                    <td className="px-4 py-3 text-zinc-600">{s.quantity}</td>
                    <td className="px-4 py-3 text-zinc-500">R$ {Number(s.unitPrice).toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium text-zinc-700">R$ {Number(s.totalPrice).toFixed(2)}</td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => openEdit(s)}>Editar</Button>
                      <Button variant="danger" onClick={() => handleDelete(s.id)}>Remover</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {detailed.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-zinc-200 p-4">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-zinc-800">{s.productName}</span>
                  <span className="font-semibold text-zinc-700">R$ {Number(s.totalPrice).toFixed(2)}</span>
                </div>
                <div className="text-xs text-zinc-400 mb-1">
                  {new Date(s.saleDate + 'T12:00:00').toLocaleDateString('pt-BR')} —{' '}
                  {s.quantity}x R$ {Number(s.unitPrice).toFixed(2)}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" onClick={() => openEdit(s)}>Editar</Button>
                  <Button variant="danger" onClick={() => handleDelete(s.id)}>Remover</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {editing && (
        <Modal title="Editar venda" onClose={closeModal}>
          <div className="mb-4 p-3 bg-zinc-50 rounded-lg">
            <p className="text-sm font-medium text-zinc-700">{editing.productName}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {new Date(editing.saleDate + 'T12:00:00').toLocaleDateString('pt-BR')} —
              R$ {Number(editing.unitPrice).toFixed(2)} por unidade
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Nova quantidade" type="number" min="1"
              {...register('quantity')} error={errors.quantity?.message}/>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}