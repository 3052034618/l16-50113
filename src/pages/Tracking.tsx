import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCustomsStore } from '@/store/useCustomsStore'
import type { Declaration, DeclarationStatus } from '@/types'
import { STATUS_LABELS, TYPE_LABELS } from '@/types'
import { PageHeader, formatDateTime } from '@/components/UI'

const COLUMNS: { status: DeclarationStatus; color: string; bgColor: string; headerBg: string; headerText: string }[] = [
  { status: 'draft', color: 'border-gray-400', bgColor: 'bg-gray-50', headerBg: 'bg-gray-100', headerText: 'text-gray-700' },
  { status: 'submitted', color: 'border-blue-400', bgColor: 'bg-blue-50/40', headerBg: 'bg-blue-100', headerText: 'text-blue-700' },
  { status: 'inspecting', color: 'border-amber-400', bgColor: 'bg-amber-50/40', headerBg: 'bg-amber-100', headerText: 'text-amber-700' },
  { status: 'released', color: 'border-emerald-400', bgColor: 'bg-emerald-50/40', headerBg: 'bg-emerald-100', headerText: 'text-emerald-700' },
  { status: 'rejected', color: 'border-red-400', bgColor: 'bg-red-50/40', headerBg: 'bg-red-100', headerText: 'text-red-700' },
]

const NEXT_ACTIONS: Record<DeclarationStatus, { label: string; target: DeclarationStatus }[]> = {
  draft: [{ label: '提交申报', target: 'submitted' }],
  submitted: [{ label: '进入查验', target: 'inspecting' }],
  inspecting: [
    { label: '放行', target: 'released' },
    { label: '退单', target: 'rejected' },
  ],
  released: [],
  rejected: [],
}

const ACTION_REMARKS: Record<string, string> = {
  submitted: '提交申报',
  inspecting: '进入查验',
  released: '放行通过',
  rejected: '退单处理',
}

function KanbanCard({
  declaration,
  isSelected,
  onSelect,
}: {
  declaration: Declaration
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`card p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-gold-400 shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-navy-500">{declaration.declarationNo}</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            declaration.type === 'import'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          }`}
        >
          {TYPE_LABELS[declaration.type]}
        </span>
      </div>
      <p className="text-xs text-navy-400 mb-1">{declaration.client}</p>
      {declaration.goods.length > 0 && (
        <p className="text-xs text-navy-300 truncate">{declaration.goods[0].name}</p>
      )}
      <p className="text-[10px] text-navy-200 mt-2">
        {formatDateTime(declaration.updatedAt)}
      </p>
    </div>
  )
}

function Timeline({ history, currentStatus }: { history: Declaration['progressHistory']; currentStatus: DeclarationStatus }) {
  return (
    <div className="space-y-0">
      {history.map((entry, idx) => {
        const isCurrent = entry.status === currentStatus && idx === history.length - 1
        return (
          <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full shrink-0 ${
                  isCurrent
                    ? 'w-4 h-4 bg-gold-500 ring-4 ring-gold-100'
                    : 'w-3 h-3 bg-navy-400'
                }`}
              />
              {idx < history.length - 1 && (
                <div className="border-l-2 border-navy-100 flex-1 mt-1" />
              )}
            </div>
            <div className="pt-0 min-w-0">
              <p className={`text-sm font-medium ${isCurrent ? 'text-gold-600' : 'text-navy-500'}`}>
                {STATUS_LABELS[entry.status]}
              </p>
              <p className="text-xs text-navy-300 mt-0.5">{formatDateTime(entry.timestamp)}</p>
              <p className="text-xs text-navy-400 mt-0.5">{entry.operator}</p>
              {entry.remark && (
                <p className="text-xs text-navy-200 mt-0.5">{entry.remark}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DetailPanel({
  declaration,
  onClose,
  onAdvanceStatus,
}: {
  declaration: Declaration
  onClose: () => void
  onAdvanceStatus: (id: string, target: DeclarationStatus) => void
}) {
  const actions = NEXT_ACTIONS[declaration.status]

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-navy-900/30" onClick={onClose} />
      <div className="relative w-[480px] bg-white shadow-xl h-full overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-white border-b border-navy-50 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-navy-500">{declaration.declarationNo}</h2>
          <button
            onClick={onClose}
            className="text-navy-300 hover:text-navy-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-navy-300">客户</p>
              <p className="text-sm font-medium text-navy-500 mt-0.5">{declaration.client}</p>
            </div>
            <div>
              <p className="text-xs text-navy-300">类型</p>
              <p className="text-sm font-medium text-navy-500 mt-0.5">{TYPE_LABELS[declaration.type]}</p>
            </div>
            <div>
              <p className="text-xs text-navy-300">当前状态</p>
              <p className="text-sm font-medium mt-0.5">
                <span className={declaration.status === 'draft' ? 'status-draft' : declaration.status === 'submitted' ? 'status-submitted' : declaration.status === 'inspecting' ? 'status-inspecting' : declaration.status === 'released' ? 'status-released' : 'status-rejected'}>
                  {STATUS_LABELS[declaration.status]}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-navy-300">创建时间</p>
              <p className="text-sm font-medium text-navy-500 mt-0.5">{formatDateTime(declaration.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-navy-300">预估税费</p>
              <p className="text-sm font-medium text-navy-500 mt-0.5">
                ¥{declaration.totalEstimatedTax.total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-navy-300">商品项数</p>
              <p className="text-sm font-medium text-navy-500 mt-0.5">{declaration.goods.length} 项</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-500 mb-3">进度记录</h3>
            <Timeline history={declaration.progressHistory} currentStatus={declaration.status} />
          </div>

          {actions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-navy-500 mb-3">状态操作</h3>
              <div className="flex gap-3">
                {actions.map((action) => (
                  <button
                    key={action.target}
                    onClick={() => onAdvanceStatus(declaration.id, action.target)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      action.target === 'rejected'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'btn-gold'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Link
            to={`/declarations/${declaration.id}`}
            className="btn-secondary inline-block text-center w-full"
          >
            查看完整详情
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Tracking() {
  const declarations = useCustomsStore((s) => s.declarations)
  const updateStatus = useCustomsStore((s) => s.updateStatus)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedDeclaration = declarations.find((d) => d.id === selectedId) ?? null

  const handleAdvanceStatus = (id: string, target: DeclarationStatus) => {
    updateStatus(id, target, ACTION_REMARKS[target])
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <PageHeader title="进度跟踪" subtitle="实时跟踪报关状态变更" />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const items = declarations.filter((d) => d.status === col.status)
          return (
            <div
              key={col.status}
              className={`shrink-0 w-[260px] flex flex-col rounded-lg border ${col.color} ${col.bgColor}`}
            >
              <div className={`px-3 py-2.5 rounded-t-lg ${col.headerBg} ${col.headerText} flex items-center justify-between`}>
                <span className="text-sm font-semibold">{STATUS_LABELS[col.status]}</span>
                <span className="text-xs opacity-75">{items.length}</span>
              </div>
              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
                {items.length === 0 ? (
                  <p className="text-xs text-navy-200 text-center py-8">暂无数据</p>
                ) : (
                  items.map((d) => (
                    <KanbanCard
                      key={d.id}
                      declaration={d}
                      isSelected={selectedId === d.id}
                      onSelect={() => setSelectedId(d.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedDeclaration && (
        <DetailPanel
          declaration={selectedDeclaration}
          onClose={() => setSelectedId(null)}
          onAdvanceStatus={handleAdvanceStatus}
        />
      )}
    </div>
  )
}
