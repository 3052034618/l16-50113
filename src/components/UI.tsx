import type { DeclarationStatus, DocumentStatus } from '@/types'
import { STATUS_LABELS, STATUS_CLASSES, DOC_STATUS_LABELS, DOC_STATUS_CLASSES } from '@/types'

export function StatusBadge({ status }: { status: DeclarationStatus }) {
  return <span className={STATUS_CLASSES[status]}>{STATUS_LABELS[status]}</span>
}

export function DocStatusBadge({ status }: { status: DocumentStatus }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DOC_STATUS_CLASSES[status]}`}>{DOC_STATUS_LABELS[status]}</span>
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-navy-500">{title}</h1>
        {subtitle && <p className="text-sm text-navy-300 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-navy-300">
      <Icon className="w-12 h-12 mb-4" />
      <h3 className="text-lg font-medium text-navy-400 mb-1">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  )
}

export function formatCurrency(value: number, currency = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency, minimumFractionDigits: 2 }).format(value)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
