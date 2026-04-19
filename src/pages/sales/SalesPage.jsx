import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { saleService } from '../../services/saleService'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import Button from '../../components/ui/Button'

const schema = z.object({
  productId: z.coerce.number().min(1, 'Selecione um produto'),
  quantity:  z.coerce.number().int().positive('Quantidade deve ser maior que zero'),
})

export default function SalesPage() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [filterCat, setFilterCat]   = useState('')
  const [success, setSuccess]       = useState(null)
  const [error, setError]           = useState('')

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { productId: '', quantity: 1 },
  })

  const selectedProductId = watch('productId')
  const selectedProduct = products.find(p => p.id === Number(selectedProductId))

  useEffect(() => {
    categoryService.getAll().then(setCategories)
  }, [])

  useEffect(() => {
    productService.getAll(filterCat || null).then(setProducts)
  }, [filterCat])

  async function onSubmit(data) {
    try {
      setError('')
      setSuccess(null)
      const sale = await saleService.create(data)
      setSuccess(sale)
      reset({ productId: '', quantity: 1 })
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar venda')
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-800">Registrar venda</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Selecione o prato e a quantidade vendida</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-700 font-medium text-sm">Venda registrada com sucesso!</p>
          <div className="mt-2 text-sm text-green-600 flex flex-col gap-1">
            <span>{success.productName}</span>
            <span>{success.quantity}x — R$ {Number(success.unitPrice).toFixed(2)} cada</span>
            <span className="font-semibold">Total: R$ {Number(success.totalPrice).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Filtrar por categoria</label>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Prato</label>
            <select {...register('productId')}
              className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400
                ${errors.productId ? 'border-red-400' : 'border-zinc-300'}`}>
              <option value="">Selecione o prato...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — R$ {Number(p.price).toFixed(2)}
                </option>
              ))}
            </select>
            {errors.productId && (
              <span className="text-xs text-red-500">{errors.productId.message}</span>
            )}
          </div>

          {selectedProduct && (
            <div className="bg-zinc-50 rounded-lg p-3 text-sm text-zinc-600 border border-zinc-100">
              <p className="font-medium text-zinc-700 mb-1">Ficha técnica</p>
              {selectedProduct.ingredients.map(i => (
                <p key={i.ingredientId}>
                  {i.ingredientName} — {i.quantity} {i.unit}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Quantidade</label>
            <input
              type="number" min="1"
              {...register('quantity')}
              className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400
                ${errors.quantity ? 'border-red-400' : 'border-zinc-300'}`}
            />
            {errors.quantity && (
              <span className="text-xs text-red-500">{errors.quantity.message}</span>
            )}
          </div>

          {selectedProduct && (
            <div className="bg-orange-50 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-orange-700">Total estimado</span>
              <span className="font-semibold text-orange-700">
                R$ {(Number(selectedProduct.price) * (watch('quantity') || 0)).toFixed(2)}
              </span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar venda'}
          </Button>
        </form>
      </div>
    </div>
  )
}