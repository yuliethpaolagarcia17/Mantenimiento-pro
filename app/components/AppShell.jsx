'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Footer from './Footer'

export default function AppShell({ children }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [colapsado, setColapsado] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee la preferencia guardada en el navegador, no se puede conocer en el servidor
    setColapsado(localStorage.getItem('sidebar-colapsado') === 'true')
  }, [])

  function alternarColapso() {
    const nuevo = !colapsado
    setColapsado(nuevo)
    localStorage.setItem('sidebar-colapsado', String(nuevo))
  }

  if (pathname === '/login') return <>{children}</>

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        colapsado={colapsado}
        onToggleColapso={alternarColapso}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </div>
    </div>
  )
}
