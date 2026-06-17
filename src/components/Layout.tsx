import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FileText, FolderOpen, Activity, Archive, BarChart3, ChevronLeft, ChevronRight, Ship } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '工作台' },
  { to: '/declarations', icon: FileText, label: '报关单' },
  { to: '/documents', icon: FolderOpen, label: '单据中心' },
  { to: '/tracking', icon: Activity, label: '进度跟踪' },
  { to: '/archive', icon: Archive, label: '历史归档' },
  { to: '/statistics', icon: BarChart3, label: '统计分析' },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-navy-50">
      <aside className={cn(
        'flex flex-col bg-navy-500 text-white transition-all duration-300 relative',
        collapsed ? 'w-16' : 'w-56'
      )}>
        <div className={cn(
          'flex items-center gap-3 px-4 h-16 border-b border-navy-400/30',
          collapsed && 'justify-center px-0'
        )}>
          <Ship className="w-7 h-7 text-gold-400 shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-serif text-base font-semibold text-gold-300 truncate">报关辅助系统</h1>
              <p className="text-[10px] text-navy-200 truncate">Customs Declaration Assistant</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-navy-400/40 text-gold-300'
                  : 'text-navy-100 hover:bg-navy-400/20 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-navy-500 border border-navy-300/30 rounded-full flex items-center justify-center text-navy-200 hover:text-gold-400 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className={cn(
          'px-4 py-3 border-t border-navy-400/30',
          collapsed && 'px-2'
        )}>
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-semibold shrink-0">
              管
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-navy-100 truncate">管理员</p>
                <p className="text-[10px] text-navy-300 truncate">admin@company.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
