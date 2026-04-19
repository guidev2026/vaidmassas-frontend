import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-zinc-100">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-20 md:pt-8">
        <Outlet />
      </main>
    </div>
  )
}
