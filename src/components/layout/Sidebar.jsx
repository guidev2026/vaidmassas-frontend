import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/ingredients', label: 'Insumos' },
  { to: '/categories', label: 'Categorias' },
  { to: '/products', label: 'Produtos' },
  { to: '/sales', label: 'Registrar Venda' },
  { to: '/history', label: 'Histórico' },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <aside className="hidden md:flex w-56 min-h-screen bg-zinc-900 flex-col flex-shrink-0">
        <div className="px-6 py-6 border-b border-zinc-700">
          <h1 className="text-white font-bold text-lg leading-tight">Vai de Massas</h1>
          <p className="text-zinc-400 text-xs mt-1">Gestão do delivery</p>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {links.map(link => (
            <NavLink key={link.to} to={link.to}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white font-medium'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-base">Vai de Massas</h1>
        </div>
        <button onClick={() => setOpen(!open)}
          className="text-white p-1 rounded-md focus:outline-none">
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-zinc-900 w-64 min-h-full p-4 pt-16" onClick={e => e.stopPropagation()}>
            <nav className="flex flex-col gap-1 mt-2">
              {links.map(link => (
                <NavLink key={link.to} to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-orange-500 text-white font-medium'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}