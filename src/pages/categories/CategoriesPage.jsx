import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { categoryService } from '../../services/categoryService'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const schema = z.object({
  name:        z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
})

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [error, setError]           = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      setCategories(await categoryService.getAll())
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    reset({ name: '', description: '' })
    setError('')
    setModalOpen(true)
  }

  function openEdit(category) {
    setEditing(category)
    reset(category)
    setError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  async function onSubmit(data) {
    try {
      setError('')
      if (editing) {
        await categoryService.update(editing.id, data)
      } else {
        await categoryService.create(data)
      }
      await load()
      closeModal()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Deseja remover esta categoria?')) return
    await categoryService.remove(id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Categorias</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Organize seus pratos por tipo</p>
        </div>
        <Button onClick={openCreate}>+ Nova categoria</Button>
      </div>

      {loading ? (
        <div className="text-zinc-400 text-sm">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Descrição</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-zinc-400">
                    Nenhuma categoria cadastrada
                  </td>
                </tr>
              )}
              {categories.map((cat, i) => (
                <tr key={cat.id}
                  className={`border-b border-zinc-50 hover:bg-zinc-50 transition-colors
                    ${i === categories.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 font-medium text-zinc-700">{cat.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{cat.description || '—'}</td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => openEdit(cat)}>Editar</Button>
                    <Button variant="danger" onClick={() => handleDelete(cat.id)}>Remover</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Editar categoria' : 'Nova categoria'} onClose={closeModal}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Nome" {...register('name')} error={errors.name?.message} />
            <Input label="Descrição" {...register('description')} />
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