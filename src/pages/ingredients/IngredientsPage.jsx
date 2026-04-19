import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ingredientService } from '../../services/ingredientService'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const schema = z.object({
  name:     z.string().min(1, 'Nome é obrigatório'),
  quantity: z.coerce.number().positive('Deve ser maior que zero'),
  unit:     z.string().min(1, 'Unidade é obrigatória'),
  minStock: z.coerce.number().positive('Deve ser maior que zero'),
})

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState(null)
  const [error, setError]             = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => { load() }, [])

  async function load() {
    try { setLoading(true); setIngredients(await ingredientService.getAll()) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditing(null); reset({ name: '', quantity: '', unit: '', minStock: '' })
    setError(''); setModalOpen(true)
  }

  function openEdit(ing) {
    setEditing(ing); reset(ing); setError(''); setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditing(null) }

  async function onSubmit(data) {
    try {
      setError('')
      editing ? await ingredientService.update(editing.id, data)
              : await ingredientService.create(data)
      await load(); closeModal()
    } catch (err) { setError(err.response?.data?.error || 'Erro ao salvar') }
  }

  async function handleDelete(id) {
    if (!confirm('Deseja remover este insumo?')) return
    await ingredientService.remove(id); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-zinc-800">Insumos</h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">Gerencie o estoque de ingredientes</p>
        </div>
        <Button onClick={openCreate}>+ Novo</Button>
      </div>

      {loading ? <div className="text-zinc-400 text-sm">Carregando...</div> : (
        <>
          <div className="hidden md:block bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Quantidade</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Unidade</th>
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Estoque mín.</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {ingredients.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-zinc-400">Nenhum insumo cadastrado</td></tr>
                )}
                {ingredients.map((ing, i) => (
                  <tr key={ing.id} className={`border-b border-zinc-50 hover:bg-zinc-50 ${i === ingredients.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-4 py-3 font-medium text-zinc-700">{ing.name}</td>
                    <td className="px-4 py-3">
                      <span className={ing.quantity <= ing.minStock ? 'text-red-500 font-medium' : 'text-zinc-600'}>
                        {ing.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{ing.unit}</td>
                    <td className="px-4 py-3 text-zinc-500">{ing.minStock}</td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => openEdit(ing)}>Editar</Button>
                      <Button variant="danger" onClick={() => handleDelete(ing.id)}>Remover</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {ingredients.length === 0 && (
              <div className="bg-white rounded-xl border border-zinc-200 py-8 text-center text-zinc-400 text-sm">
                Nenhum insumo cadastrado
              </div>
            )}
            {ingredients.map(ing => (
              <div key={ing.id} className="bg-white rounded-xl border border-zinc-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="font-medium text-zinc-800">{ing.name}</span>
                  <span className={`text-sm font-semibold ${ing.quantity <= ing.minStock ? 'text-red-500' : 'text-zinc-600'}`}>
                    {ing.quantity} {ing.unit}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 mb-3">Estoque mín: {ing.minStock} {ing.unit}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => openEdit(ing)}>Editar</Button>
                  <Button variant="danger" onClick={() => handleDelete(ing.id)}>Remover</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Editar insumo' : 'Novo insumo'} onClose={closeModal}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Nome" {...register('name')} error={errors.name?.message}/>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Quantidade" type="number" step="0.001" {...register('quantity')} error={errors.quantity?.message}/>
              <Input label="Unidade" placeholder="kg, litro..." {...register('unit')} error={errors.unit?.message}/>
            </div>
            <Input label="Estoque mínimo" type="number" step="0.001" {...register('minStock')} error={errors.minStock?.message}/>
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}