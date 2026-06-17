import { useState, useMemo } from 'react'
import { useCustomsStore } from '@/store/useCustomsStore'
import { TYPE_LABELS } from '@/types'
import { StatusBadge, PageHeader, formatCurrency, formatDate, EmptyState } from '@/components/UI'
import { Archive as ArchiveIcon, Search as MagnifyingGlassIcon, RotateCcw as ArrowPathIcon, ChevronUp as ChevronUpIcon, ChevronDown as ChevronDownIcon } from 'lucide-react'

export default function Archive() {
  const { declarations, reuseDeclaration } = useCustomsStore()
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reuseMsg, setReuseMsg] = useState<string | null>(null)

  const archived = useMemo(
    () => declarations.filter(d => d.status === 'released'),
    [declarations]
  )

  const clients = useMemo(
    () => [...new Set(archived.map(d => d.client))].sort(),
    [archived]
  )

  const filtered = useMemo(() => {
    let result = archived
    if (selectedClient !== 'all') {
      result = result.filter(d => d.client === selectedClient)
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase()
      result = result.filter(d =>
        d.goods.some(g => g.name.toLowerCase().includes(kw) || g.hsCode.includes(kw))
      )
    }
    return result
  }, [archived, selectedClient, searchKeyword])

  const handleReuse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newDecl = reuseDeclaration(id)
    if (newDecl) {
      setReuseMsg(`已从报关单复用创建新单 ${newDecl.declarationNo}`)
      setTimeout(() => setReuseMsg(null), 3000)
    }
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <PageHeader title="历史归档" subtitle="按客户和货物类型归档历史报关记录" />

      {reuseMsg && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          {reuseMsg}
        </div>
      )}

      <div className="flex gap-6">
        <aside className="w-56 shrink-0">
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold text-navy-700 mb-3">客户筛选</h3>
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedClient('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedClient === 'all'
                    ? 'bg-navy-600 text-white font-medium'
                    : 'text-navy-500 hover:bg-navy-50'
                }`}
              >
                全部客户
                <span className="ml-2 text-xs opacity-70">({archived.length})</span>
              </button>
              {clients.map(client => {
                const count = archived.filter(d => d.client === client).length
                return (
                  <button
                    key={client}
                    onClick={() => setSelectedClient(client)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                      selectedClient === client
                        ? 'bg-navy-600 text-white font-medium'
                        : 'text-navy-500 hover:bg-navy-50'
                    }`}
                  >
                    {client}
                    <span className="ml-2 text-xs opacity-70">({count})</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-5 flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
              <input
                type="text"
                placeholder="搜索货物名称或HS编码..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent bg-white placeholder:text-navy-300"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={ArchiveIcon}
              title="暂无归档记录"
              description={archived.length === 0 ? '还没有已放行的报关记录' : '没有匹配的归档记录，请调整筛选条件'}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filtered.map(decl => {
                const isExpanded = expandedId === decl.id
                const firstGood = decl.goods[0]
                return (
                  <div
                    key={decl.id}
                    onClick={() => setExpandedId(isExpanded ? null : decl.id)}
                    className={`bg-white border rounded-xl cursor-pointer transition-all duration-200 ${
                      isExpanded ? 'border-navy-400 shadow-lg ring-1 ring-navy-100' : 'border-navy-100 hover:border-navy-300 hover:shadow-md'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-navy-800 truncate mr-2">{decl.client}</h3>
                        <span
                          className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            decl.type === 'import'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}
                        >
                          {TYPE_LABELS[decl.type]}
                        </span>
                      </div>

                      <p className="text-sm text-navy-500 font-mono mb-2">{decl.declarationNo}</p>

                      {firstGood && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-navy-700 font-medium truncate">{firstGood.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-navy-50 text-navy-500 rounded font-mono">{firstGood.hsCode}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-navy-400 mb-0.5">预估税费合计</p>
                          <p className="text-base font-semibold text-gold-600">{formatCurrency(decl.totalEstimatedTax.total)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-navy-400 mb-0.5">放行日期</p>
                          <p className="text-sm text-navy-600">{formatDate(decl.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy-50">
                        <StatusBadge status={decl.status} />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => handleReuse(decl.id, e)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-navy-600 text-white hover:bg-navy-700 transition-colors"
                          >
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            复用
                          </button>
                          {isExpanded ? (
                            <ChevronUpIcon className="w-4 h-4 text-navy-400" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4 text-navy-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-navy-100 px-5 pb-5 pt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-navy-700 mb-2">货物明细</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-navy-100 text-navy-400">
                                  <th className="text-left py-1.5 pr-3 font-medium">品名</th>
                                  <th className="text-left py-1.5 pr-3 font-medium">HS编码</th>
                                  <th className="text-right py-1.5 pr-3 font-medium">数量</th>
                                  <th className="text-left py-1.5 pr-3 font-medium">单位</th>
                                  <th className="text-right py-1.5 pr-3 font-medium">申报价值</th>
                                  <th className="text-left py-1.5 font-medium">币制</th>
                                </tr>
                              </thead>
                              <tbody>
                                {decl.goods.map(g => (
                                  <tr key={g.id} className="border-b border-navy-50">
                                    <td className="py-1.5 pr-3 text-navy-700">{g.name}</td>
                                    <td className="py-1.5 pr-3 font-mono text-navy-500">{g.hsCode}</td>
                                    <td className="py-1.5 pr-3 text-right text-navy-600">{g.quantity}</td>
                                    <td className="py-1.5 pr-3 text-navy-500">{g.unit}</td>
                                    <td className="py-1.5 pr-3 text-right text-navy-600">{formatCurrency(g.declaredValue, g.currency)}</td>
                                    <td className="py-1.5 text-navy-500">{g.currency}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-navy-700 mb-2">税费明细</h4>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="bg-navy-50 rounded-lg p-2.5 text-center">
                              <p className="text-xs text-navy-400 mb-1">关税</p>
                              <p className="text-sm font-semibold text-navy-700">{formatCurrency(decl.totalEstimatedTax.customsDuty)}</p>
                            </div>
                            <div className="bg-navy-50 rounded-lg p-2.5 text-center">
                              <p className="text-xs text-navy-400 mb-1">增值税</p>
                              <p className="text-sm font-semibold text-navy-700">{formatCurrency(decl.totalEstimatedTax.vat)}</p>
                            </div>
                            <div className="bg-navy-50 rounded-lg p-2.5 text-center">
                              <p className="text-xs text-navy-400 mb-1">消费税</p>
                              <p className="text-sm font-semibold text-navy-700">{formatCurrency(decl.totalEstimatedTax.consumptionTax)}</p>
                            </div>
                            <div className="bg-gold-50 rounded-lg p-2.5 text-center">
                              <p className="text-xs text-gold-600 mb-1">合计</p>
                              <p className="text-sm font-semibold text-gold-700">{formatCurrency(decl.totalEstimatedTax.total)}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-navy-700 mb-2">流程记录</h4>
                          <div className="space-y-0">
                            {decl.progressHistory.map((entry, idx) => (
                              <div key={idx} className="flex gap-3 pb-3 last:pb-0">
                                <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full bg-navy-400 mt-1.5 shrink-0" />
                                  {idx < decl.progressHistory.length - 1 && (
                                    <div className="w-px flex-1 bg-navy-100 mt-1" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <StatusBadge status={entry.status} />
                                    <span className="text-xs text-navy-400">{entry.operator}</span>
                                  </div>
                                  <p className="text-xs text-navy-500 mt-0.5">{entry.remark}</p>
                                  <p className="text-xs text-navy-300 mt-0.5">{formatDate(entry.timestamp)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
