import { useMemo } from 'react'
import { Ship, FileText, Coins, CheckCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useCustomsStore } from '@/store/useCustomsStore'
import { StatusBadge, PageHeader, formatCurrency, formatDateTime } from '@/components/UI'
import type { DeclarationStatus } from '@/types'
import { STATUS_LABELS } from '@/types'

const STATUS_BORDER_COLORS: Record<DeclarationStatus, string> = {
  draft: 'border-l-gray-400',
  submitted: 'border-l-blue-500',
  inspecting: 'border-l-amber-500',
  released: 'border-l-emerald-500',
  rejected: 'border-l-red-500',
}

interface ActivityItem {
  id: string
  timestamp: string
  declarationNo: string
  status: DeclarationStatus
  client: string
  remark: string
}

function getRecentActivities(declarations: ReturnType<typeof useCustomsStore.getState>['declarations']): ActivityItem[] {
  const items: ActivityItem[] = []
  for (const decl of declarations) {
    for (const entry of decl.progressHistory) {
      items.push({
        id: `${decl.id}-${entry.timestamp}`,
        timestamp: entry.timestamp,
        declarationNo: decl.declarationNo,
        status: entry.status,
        client: decl.client,
        remark: entry.remark,
      })
    }
  }
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return items.slice(0, 10)
}

function getMonthlyTrends(declarations: ReturnType<typeof useCustomsStore.getState>['declarations']) {
  const now = new Date()
  const months: { label: string; batchCount: number; taxTotal: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const label = `${month + 1}月`

    let batchCount = 0
    let taxTotal = 0

    for (const decl of declarations) {
      const created = new Date(decl.createdAt)
      if (created.getFullYear() === year && created.getMonth() === month) {
        batchCount++
        taxTotal += decl.totalEstimatedTax.total
      }
    }

    months.push({ label, batchCount, taxTotal: Math.round(taxTotal) })
  }

  return months
}

export default function Dashboard() {
  const declarations = useCustomsStore(s => s.declarations)

  const metrics = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyBatches = declarations.filter(d => {
      const created = new Date(d.createdAt)
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear
    }).length

    const pendingCount = declarations.filter(d =>
      d.status === 'draft' || d.status === 'submitted' || d.status === 'inspecting'
    ).length

    const totalTax = declarations.reduce((sum, d) => sum + d.totalEstimatedTax.total, 0)

    const releasedCount = declarations.filter(d => d.status === 'released').length
    const completedCount = declarations.filter(d => d.status === 'released' || d.status === 'rejected').length
    const releaseRate = completedCount > 0 ? Math.round((releasedCount / completedCount) * 100) : 0

    return { monthlyBatches, pendingCount, totalTax, releaseRate }
  }, [declarations])

  const recentActivities = useMemo(() => getRecentActivities(declarations), [declarations])
  const monthlyTrends = useMemo(() => getMonthlyTrends(declarations), [declarations])

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <PageHeader title="工作台" subtitle="海关报关管理概览" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="animate-fade-in-up animate-delay-1 bg-gradient-to-br from-navy-500 to-navy-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-navy-200">本月进出口批次</span>
            <Ship className="w-5 h-5 text-gold-400" />
          </div>
          <div className="text-3xl font-serif font-bold text-gold-300">{metrics.monthlyBatches}</div>
          <div className="text-xs text-navy-300 mt-1">批</div>
        </div>

        <div className="animate-fade-in-up animate-delay-2 bg-gradient-to-br from-navy-500 to-navy-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-navy-200">待处理报关单</span>
            <FileText className="w-5 h-5 text-gold-400" />
          </div>
          <div className="text-3xl font-serif font-bold text-gold-300">{metrics.pendingCount}</div>
          <div className="text-xs text-navy-300 mt-1">单</div>
        </div>

        <div className="animate-fade-in-up animate-delay-3 bg-gradient-to-br from-navy-500 to-navy-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-navy-200">应缴税款总额</span>
            <Coins className="w-5 h-5 text-gold-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-gold-300">{formatCurrency(metrics.totalTax)}</div>
          <div className="text-xs text-navy-300 mt-1">人民币</div>
        </div>

        <div className="animate-fade-in-up animate-delay-4 bg-gradient-to-br from-navy-500 to-navy-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-navy-200">放行率</span>
            <CheckCircle className="w-5 h-5 text-gold-400" />
          </div>
          <div className="text-3xl font-serif font-bold text-gold-300">{metrics.releaseRate}%</div>
          <div className="text-xs text-navy-300 mt-1">已放行 / 已结案</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h2 className="text-base font-serif font-semibold text-navy-500 mb-4">批次趋势</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="batchGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A84A" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#D4A84A" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#5175A0' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#5175A0' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #C5D1DF' }}
                  formatter={(value: number) => [`${value} 批`, '批次']}
                />
                <Area type="monotone" dataKey="batchCount" stroke="#C8A45C" strokeWidth={2} fill="url(#batchGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-serif font-semibold text-navy-500 mb-4">税款趋势</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#5175A0' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#5175A0' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #C5D1DF' }}
                  formatter={(value: number) => [formatCurrency(value), '税款']}
                />
                <Area type="monotone" dataKey="taxTotal" stroke="#F59E0B" strokeWidth={2} fill="url(#taxGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-base font-serif font-semibold text-navy-500 mb-4">近期动态</h2>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-navy-300 py-8 text-center">暂无动态</p>
        ) : (
          <div className="space-y-0">
            {recentActivities.map(item => (
              <div
                key={item.id}
                className={`flex items-start gap-4 py-3 border-l-4 ${STATUS_BORDER_COLORS[item.status]} pl-4 hover:bg-navy-50/50 transition-colors`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-navy-500">{item.declarationNo}</span>
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-navy-300">{item.client}</span>
                  </div>
                  <p className="text-sm text-navy-400">{item.remark}</p>
                </div>
                <span className="text-xs text-navy-300 whitespace-nowrap pt-0.5">{formatDateTime(item.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
