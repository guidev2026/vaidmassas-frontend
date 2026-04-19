import { NavLink } from 'react-router-dom'

const links = [
  { to: '/ingredients', label: 'Insumos' },
  { to: '/categories', label: 'Categorias' },
  { to: '/products', label: 'Produtos' },
  { to: '/sales', label: 'Registrar Venda' },
  { to: '/history', label: 'Histórico' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-zinc-900 flex flex-col">
      <div className="px-6 py-6 border-b border-zinc-700">
        <h1 className="text-white font-bold text-lg leading-tight">
          Vaidmassas
        </h1>
        <p className="text-zinc-400 text-xs mt-1">Gestão do delivery</p>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-orange-500 text-white font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}