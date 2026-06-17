import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCustomsStore } from '@/store/useCustomsStore'
import { STATUS_LABELS, TYPE_LABELS } from '@/types'
import type { DeclarationStatus, DeclarationType } from '@/types'
import { StatusBadge, PageHeader, EmptyState, formatCurrency, formatDate } from '@/components/UI'

const statusOptions: { value: '' | DeclarationStatus; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'submitted', label: '已申报' },
  { value: 'inspecting', label: '查验中' },
  { value: 'released', label: '已放行' },
  { value: 'rejected', label: '退单' },
]

const typeOptions: { value: '' | DeclarationType; label: string }[] = [
  { value: '', label: '全部类型' },
  { value: 'import', label: '进口' },
  { value: 'export', label: '出口' },
]

export default function DeclarationList() {
  const navigate = useNavigate()
  const declarations = useCustomsStore(s => s.declarations)
  const deleteDeclaration = useCustomsStore(s => s.deleteDeclaration)

  const [statusFilter, setStatusFilter] = useState<'' | DeclarationStatus>('')
  const [typeFilter, setTypeFilter] = useState<'' | DeclarationType>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const filtered = declarations.filter(d => {
    if (statusFilter && d.status !== statusFilter) return false
    if (typeFilter && d.type !== typeFilter) return false
    if (dateFrom && d.createdAt < dateFrom) return false
    if (dateTo && d.createdAt > dateTo) return false
    if (search) {
      const kw = search.toLowerCase()
      const matchNo = d.declarationNo.toLowerCase().includes(kw)
      const matchGoods = d.goods.some(g => g.name.toLowerCase().includes(kw) || g.hsCode.includes(kw))
      if (!matchNo && !matchGoods) return false
    }
    return true
  })

  const handleDelete = (id: string) => {
    deleteDeclaration(id)
    setConfirmDeleteId(null)
  }

  const handleReset = () => {
    setStatusFilter('')
    setTypeFilter('')
    setDateFrom('')
    setDateTo('')
    setSearch('')
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <PageHeader
        title="报关单管理"
        action={
          <button
            onClick={() => navigate('/declarations/new')}
            className="inline-flex items-center px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建报关单
          </button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-navy-400 mb-1">状态</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as '' | DeclarationStatus)}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
            >
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-navy-400 mb-1">进出口</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as '' | DeclarationType)}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
            >
              {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-navy-400 mb-1">起始日期</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-navy-400 mb-1">截止日期</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
            />
          </div>

          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-xs text-navy-400 mb-1">HS编码/品名</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索HS编码或品名..."
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="h-9 px-4 rounded-lg border border-gray-200 text-sm text-navy-400 hover:bg-gray-50 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={() => (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          title="暂无报关单"
          description="点击右上角新建报关单开始录入"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy-50 text-navy-600">
                <th className="text-left px-4 py-3 font-medium">报关单号</th>
                <th className="text-left px-4 py-3 font-medium">进出口</th>
                <th className="text-left px-4 py-3 font-medium">品名</th>
                <th className="text-left px-4 py-3 font-medium">HS编码</th>
                <th className="text-right px-4 py-3 font-medium">申报价值</th>
                <th className="text-center px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium">创建时间</th>
                <th className="text-center px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, idx) => (
                <tr
                  key={d.id}
                  className={`border-t border-gray-50 hover:bg-gold-50/30 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                >
                  <td className="px-4 py-3 font-mono text-navy-700">{d.declarationNo}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${d.type === 'import' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                      {TYPE_LABELS[d.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy-700 max-w-[200px] truncate">{d.goods[0]?.name || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.goods[0]?.hsCode || '-'}</td>
                  <td className="px-4 py-3 text-right text-navy-700">{d.goods[0] ? formatCurrency(d.goods[0].declaredValue, d.goods[0].currency) : '-'}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-navy-500">{formatDate(d.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/declarations/${d.id}`}
                        className="text-gold-600 hover:text-gold-700 font-medium"
                      >
                        查看
                      </Link>
                      {confirmDeleteId === d.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-xs"
                          >
                            确认
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-navy-400 hover:text-navy-500 text-xs"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(d.id)}
                          className="text-red-500 hover:text-red-600 font-medium"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-navy-400">
            共 {filtered.length} 条记录
          </div>
        </div>
      )}
    </div>
  )
}
