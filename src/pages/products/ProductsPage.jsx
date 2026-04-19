import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import { ingredientService } from '../../services/ingredientService'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const schema = z.object({
  name:       z.string().min(1, 'Nome é obrigatório'),
  price:      z.coerce.number().positive('Preço deve ser maior que zero'),
  categoryId: z.coerce.number().min(1, 'Categoria é obrigatória'),
  ingredients: z.array(z.object({
    ingredientId: z.coerce.number().min(1, 'Selecione um ingrediente'),
    quantity:     z.coerce.number().positive('Quantidade deve ser maior que zero'),
    unit:         z.string().min(1, 'Unidade é obrigatória'),
  })).min(1, 'Adicione pelo menos um ingrediente'),
})

export default function ProductsPage() {
  const [products, setProducts]       = useState([])
  const [categories, setCategories]   = useState([])
  const [ingredients, setIngredients] = useState([])
  const [filterCat, setFilterCat]     = useState('')
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState(null)
  const [error, setError]             = useState('')

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ingredients: [{ ingredientId: '', quantity: '', unit: '' }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })

  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      ingredientService.getAll(),
    ]).then(([cats, ings]) => {
      setCategories(cats)
      setIngredients(ings)
    })
  }, [])

  useEffect(() => { load() }, [filterCat])

  async function load() {
    try {
      setLoading(true)
      setProducts(await productService.getAll(filterCat || null))
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    reset({
      name: '', price: '', categoryId: '',
      ingredients: [{ ingredientId: '', quantity: '', unit: '' }],
    })
    setError('')
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditing(product)
    reset({
      name:       product.name,
      price:      product.price,
      categoryId: product.category.id,
      ingredients: product.ingredients.map(i => ({
        ingredientId: i.ingredientId,
        quantity:     i.quantity,
        unit:         i.unit,
      })),
    })
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
        await productService.update(editing.id, data)
      } else {
        await productService.create(data)
      }
      await load()
      closeModal()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Deseja remover este produto?')) return
    await productService.remove(id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Produtos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Cardápio com ficha técnica</p>
        </div>
        <Button onClick={openCreate}>+ Novo produto</Button>
      </div>

      <div className="mb-4">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Todas as categorias</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-zinc-400 text-sm">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Categoria</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Preço</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Ingredientes</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-zinc-400">
                    Nenhum produto cadastrado
                  </td>
                </tr>
              )}
              {products.map((p, i) => (
                <tr key={p.id}
                  className={`border-b border-zinc-50 hover:bg-zinc-50 transition-colors
                    ${i === products.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 font-medium text-zinc-700">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                      {p.category.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    R$ {Number(p.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {p.ingredients.map(i => i.ingredientName).join(', ')}
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => openEdit(p)}>Editar</Button>
                    <Button variant="danger" onClick={() => handleDelete(p.id)}>Remover</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Editar produto' : 'Novo produto'} onClose={closeModal}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input label="Nome do prato" {...register('name')} error={errors.name?.message} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Preço (R$)" type="number" step="0.01"
                {...register('price')} error={errors.price?.message} />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700">Categoria</label>
                <select {...register('categoryId')}
                  className="border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="">Selecione...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="text-xs text-red-500">{errors.categoryId.message}</span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-700">Ficha técnica</label>
                <button type="button"
                  onClick={() => append({ ingredientId: '', quantity: '', unit: '' })}
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                  + Adicionar ingrediente
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <select {...register(`ingredients.${index}.ingredientId`)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400">
                        <option value="">Ingrediente...</option>
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>{ing.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input type="number" step="0.001" placeholder="Qtd"
                        {...register(`ingredients.${index}.quantity`)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div className="w-20">
                      <input placeholder="Un." {...register(`ingredients.${index}.unit`)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none mt-2">
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.ingredients && (
                <span className="text-xs text-red-500 mt-1 block">
                  {errors.ingredients.message || errors.ingredients.root?.message}
                </span>
              )}
            </div>

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