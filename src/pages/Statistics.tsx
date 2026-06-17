import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useCustomsStore } from '@/store/useCustomsStore'
import { PageHeader, formatCurrency } from '@/components/UI'

interface MonthlyBatch {
  month: string
 进口批次数: number
  出口批次数: number
}

interface MonthlyTax {
  month: string
  关税: number
  增值税: number
  消费税: number
}

interface CategoryStat {
  category: string
  count: number
  totalValue: number
  totalTax: number
}

function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7)
}

function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-')
  return `${m}月`
}

const hsCategoryMap: Record<string, string> = {
  '8471300000': '电子产品',
  '8517120000': '电子产品',
  '8542310000': '电子产品',
  '2709000000': '能源',
  '2701120000': '能源',
  '2601110000': '矿产',
  '7207110000': '钢材',
  '7208390000': '钢材',
  '1005100000': '农产品',
  '1006300000': '农产品',
  '5201000001': '农产品',
  '2204210000': '食品饮料',
  '2203000000': '食品饮料',
  '2402200000': '烟草',
  '6110200000': '纺织品',
  '6203420000': '纺织品',
  '6403990000': '鞋类',
  '9503008900': '玩具',
  '3926900000': '塑料制品',
  '7318150000': '五金',
  '8703230000': '汽车',
  '8703240000': '汽车',
  '8802400000': '航空',
  '3004900000': '医药',
  '9018900000': '医疗器械',
  '4703210000': '纸浆',
  '4811410000': '纸品',
  '7102390000': '珠宝',
  '9101110000': '奢侈品',
  '3303000000': '化妆品',
}

function getHsCategory(hsCode: string): string {
  return hsCategoryMap[hsCode] || '其他'
}

export default function Statistics() {
  const declarations = useCustomsStore((s) => s.declarations)

  const sortedDeclarations = useMemo(() => {
    return [...declarations].sort(
      (a, b) => a.createdAt.localeCompare(b.createdAt)
    )
  }, [declarations])

  const allMonths = useMemo(() => {
    const monthSet = new Set<string>()
    sortedDeclarations.forEach((d) => monthSet.add(getMonthKey(d.createdAt)))
    return Array.from(monthSet).sort()
  }, [sortedDeclarations])

  const last12Months = useMemo(() => {
    return allMonths.slice(-12)
  }, [allMonths])

  const monthlyBatchData: MonthlyBatch[] = useMemo(() => {
    return last12Months.map((month) => {
      const monthDecls = sortedDeclarations.filter(
        (d) => getMonthKey(d.createdAt) === month
      )
      return {
        month: formatMonthLabel(month),
        进口批次数: monthDecls.filter((d) => d.type === 'import').length,
        出口批次数: monthDecls.filter((d) => d.type === 'export').length,
      }
    })
  }, [sortedDeclarations, last12Months])

  const monthlyTaxData: MonthlyTax[] = useMemo(() => {
    return last12Months.map((month) => {
      const monthDecls = sortedDeclarations.filter(
        (d) => getMonthKey(d.createdAt) === month
      )
      return {
        month: formatMonthLabel(month),
        关税: monthDecls.reduce(
          (sum, d) => sum + d.totalEstimatedTax.customsDuty,
          0
        ),
        增值税: monthDecls.reduce(
          (sum, d) => sum + d.totalEstimatedTax.vat,
          0
        ),
        消费税: monthDecls.reduce(
          (sum, d) => sum + d.totalEstimatedTax.consumptionTax,
          0
        ),
      }
    })
  }, [sortedDeclarations, last12Months])

  const last6Months = useMemo(() => {
    return allMonths.slice(-6)
  }, [allMonths])

  const budgetPrediction = useMemo(() => {
    const last6Tax = last6Months.map((month) => {
      const monthDecls = sortedDeclarations.filter(
        (d) => getMonthKey(d.createdAt) === month
      )
      return {
        customsDuty: monthDecls.reduce(
          (sum, d) => sum + d.totalEstimatedTax.customsDuty,
          0
        ),
        vat: monthDecls.reduce(
          (sum, d) => sum + d.totalEstimatedTax.vat,
          0
        ),
        consumptionTax: monthDecls.reduce(
          (sum, d) => sum + d.totalEstimatedTax.consumptionTax,
          0
        ),
      }
    })

    if (last6Tax.length === 0) {
      return { avgCustomsDuty: 0, avgVat: 0, avgConsumptionTax: 0, avgTotal: 0, quarters: [] as { month: string; customsDuty: number; vat: number; consumptionTax: number; total: number }[] }
    }

    const avgCustomsDuty = last6Tax.reduce((s, t) => s + t.customsDuty, 0) / last6Tax.length
    const avgVat = last6Tax.reduce((s, t) => s + t.vat, 0) / last6Tax.length
    const avgConsumptionTax = last6Tax.reduce((s, t) => s + t.consumptionTax, 0) / last6Tax.length
    const avgTotal = avgCustomsDuty + avgVat + avgConsumptionTax

    const now = new Date()
    const quarters: { month: string; customsDuty: number; vat: number; consumptionTax: number; total: number }[] = []
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const label = `${d.getFullYear()}年${d.getMonth() + 1}月`
      quarters.push({
        month: label,
        customsDuty: Math.round(avgCustomsDuty * 100) / 100,
        vat: Math.round(avgVat * 100) / 100,
        consumptionTax: Math.round(avgConsumptionTax * 100) / 100,
        total: Math.round(avgTotal * 100) / 100,
      })
    }

    return {
      avgCustomsDuty,
      avgVat,
      avgConsumptionTax,
      avgTotal,
      quarters,
    }
  }, [sortedDeclarations, last6Months])

  const categoryStats: CategoryStat[] = useMemo(() => {
    const map = new Map<string, { count: number; totalValue: number; totalTax: number }>()
    sortedDeclarations.forEach((d) => {
      const firstGoods = d.goods[0]
      const category = firstGoods ? getHsCategory(firstGoods.hsCode) : '其他'
      const existing = map.get(category) || { count: 0, totalValue: 0, totalTax: 0 }
      existing.count += 1
      existing.totalValue += firstGoods?.declaredValue || 0
      existing.totalTax += d.totalEstimatedTax.total
      map.set(category, existing)
    })
    return Array.from(map.entries())
      .map(([category, stat]) => ({ category, ...stat }))
      .sort((a, b) => b.totalValue - a.totalValue)
  }, [sortedDeclarations])

  const maxCategoryValue = useMemo(() => {
    if (categoryStats.length === 0) return 1
    return Math.max(...categoryStats.map((c) => c.totalValue))
  }, [categoryStats])

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <PageHeader title="统计分析" subtitle="进出口数据趋势与财务预算辅助" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-navy-500 mb-4">月度批次趋势</h2>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthlyBatchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" />
              <XAxis dataKey="month" tick={{ fill: '#5175A0', fontSize: 12 }} />
              <YAxis tick={{ fill: '#5175A0', fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="进口批次数"
                stroke="#C8A45C"
                fill="#C8A45C"
                fillOpacity={0.25}
              />
              <Area
                type="monotone"
                dataKey="出口批次数"
                stroke="#5175A0"
                fill="#5175A0"
                fillOpacity={0.25}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-navy-500 mb-4">月度税费趋势</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyTaxData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" />
              <XAxis dataKey="month" tick={{ fill: '#5175A0', fontSize: 12 }} />
              <YAxis tick={{ fill: '#5175A0', fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="关税" stackId="tax" fill="#5175A0" />
              <Bar dataKey="增值税" stackId="tax" fill="#D4A84A" />
              <Bar dataKey="消费税" stackId="tax" fill="#A8843A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-navy-500 mb-2">财务预算预测</h2>
          <p className="text-sm text-navy-300 mb-4">
            基于近6个月平均税费预测下季度
          </p>
          <div className="mb-4 grid grid-cols-4 gap-4">
            <div className="bg-navy-50 rounded-lg p-3 text-center">
              <div className="text-xs text-navy-300 mb-1">月均关税</div>
              <div className="text-sm font-semibold text-navy-500">
                {formatCurrency(budgetPrediction.avgCustomsDuty)}
              </div>
            </div>
            <div className="bg-navy-50 rounded-lg p-3 text-center">
              <div className="text-xs text-navy-300 mb-1">月均增值税</div>
              <div className="text-sm font-semibold text-navy-500">
                {formatCurrency(budgetPrediction.avgVat)}
              </div>
            </div>
            <div className="bg-navy-50 rounded-lg p-3 text-center">
              <div className="text-xs text-navy-300 mb-1">月均消费税</div>
              <div className="text-sm font-semibold text-navy-500">
                {formatCurrency(budgetPrediction.avgConsumptionTax)}
              </div>
            </div>
            <div className="bg-gold-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gold-600 mb-1">月均合计</div>
              <div className="text-sm font-semibold text-gold-700">
                {formatCurrency(budgetPrediction.avgTotal)}
              </div>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-50">
                <th className="text-left py-2 text-navy-400 font-medium">月份</th>
                <th className="text-right py-2 text-navy-400 font-medium">预计关税</th>
                <th className="text-right py-2 text-navy-400 font-medium">预计增值税</th>
                <th className="text-right py-2 text-navy-400 font-medium">预计消费税</th>
                <th className="text-right py-2 text-navy-400 font-medium">预计合计</th>
              </tr>
            </thead>
            <tbody>
              {budgetPrediction.quarters.map((q) => (
                <tr key={q.month} className="border-b border-navy-50">
                  <td className="py-2 text-navy-500">{q.month}</td>
                  <td className="py-2 text-right text-navy-400">
                    {formatCurrency(q.customsDuty)}
                  </td>
                  <td className="py-2 text-right text-navy-400">
                    {formatCurrency(q.vat)}
                  </td>
                  <td className="py-2 text-right text-navy-400">
                    {formatCurrency(q.consumptionTax)}
                  </td>
                  <td className="py-2 text-right font-semibold text-gold-600">
                    {formatCurrency(q.total)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gold-50">
                <td className="py-2 font-medium text-gold-700">季度合计</td>
                <td className="py-2 text-right text-gold-600">
                  {formatCurrency(budgetPrediction.avgCustomsDuty * 3)}
                </td>
                <td className="py-2 text-right text-gold-600">
                  {formatCurrency(budgetPrediction.avgVat * 3)}
                </td>
                <td className="py-2 text-right text-gold-600">
                  {formatCurrency(budgetPrediction.avgConsumptionTax * 3)}
                </td>
                <td className="py-2 text-right font-bold text-gold-700">
                  {formatCurrency(budgetPrediction.avgTotal * 3)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-navy-500 mb-4">品类统计</h2>
          {categoryStats.length === 0 ? (
            <div className="text-center py-12 text-navy-300">暂无数据</div>
          ) : (
            <div className="space-y-3">
              {categoryStats.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-navy-500">
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-4 text-xs text-navy-300">
                      <span>{cat.count}批次</span>
                      <span>税费 {formatCurrency(cat.totalTax)}</span>
                      <span className="font-medium text-navy-400">
                        {formatCurrency(cat.totalValue)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-navy-50 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-navy-300 to-gold-400 h-2.5 rounded-full"
                      style={{
                        width: `${(cat.totalValue / maxCategoryValue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
