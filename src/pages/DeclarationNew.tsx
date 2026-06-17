import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomsStore } from '@/store/useCustomsStore'
import type { DeclarationType, HSCodeTaxRate, TaxBreakdown } from '@/types'
import { PageHeader, formatCurrency } from '@/components/UI'

interface GoodsForm {
  name: string
  hsCode: string
  quantity: number
  unit: string
  declaredValue: number
  currency: string
  origin: string
}

const defaultGoods: GoodsForm = {
  name: '',
  hsCode: '',
  quantity: 1,
  unit: '件',
  declaredValue: 0,
  currency: 'USD',
  origin: '',
}

const unitOptions = ['台', '千克', '吨', '件', '个', '箱', '套', '米']
const currencyOptions = ['USD', 'CNY']

export default function DeclarationNew() {
  const navigate = useNavigate()
  const addDeclaration = useCustomsStore(s => s.addDeclaration)
  const searchHSCode = useCustomsStore(s => s.searchHSCode)
  const queryHSCode = useCustomsStore(s => s.queryHSCode)
  const calculateTax = useCustomsStore(s => s.calculateTax)
  const generateDocuments = useCustomsStore(s => s.generateDocuments)
  const reuseDeclaration = useCustomsStore(s => s.reuseDeclaration)
  const declarations = useCustomsStore(s => s.declarations)

  const [declType, setDeclType] = useState<DeclarationType>('import')
  const [client, setClient] = useState('')
  const [goods, setGoods] = useState<GoodsForm>({ ...defaultGoods })
  const [hsResults, setHsResults] = useState<HSCodeTaxRate[]>([])
  const [hsDropdownOpen, setHsDropdownOpen] = useState(false)
  const [selectedHs, setSelectedHs] = useState<HSCodeTaxRate | null>(null)
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null)
  const [reuseModalOpen, setReuseModalOpen] = useState(false)

  const hsInputRef = useRef<HTMLInputElement>(null)
  const hsDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hsDropdownOpen) {
      const handler = (e: MouseEvent) => {
        if (hsDropdownRef.current && !hsDropdownRef.current.contains(e.target as Node) && e.target !== hsInputRef.current) {
          setHsDropdownOpen(false)
        }
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }
  }, [hsDropdownOpen])

  useEffect(() => {
    if (selectedHs && goods.declaredValue > 0) {
      const result = calculateTax(selectedHs.hsCode, goods.declaredValue)
      setTaxBreakdown(result)
    } else {
      setTaxBreakdown(null)
    }
  }, [selectedHs, goods.declaredValue, calculateTax])

  const handleHsSearch = (value: string) => {
    if (selectedHs && selectedHs.hsCode !== value) {
      setSelectedHs(null)
      setTaxBreakdown(null)
      setGoods(prev => ({
        ...prev,
        hsCode: value,
        name: prev.name === selectedHs.description ? '' : prev.name,
      }))
    } else {
      setGoods(prev => ({ ...prev, hsCode: value }))
    }
    if (value.trim().length >= 2) {
      const results = searchHSCode(value.trim())
      setHsResults(results)
      setHsDropdownOpen(results.length > 0)
    } else {
      setHsResults([])
      setHsDropdownOpen(false)
    }
  }

  const handleHsSelect = (item: HSCodeTaxRate) => {
    setGoods(prev => ({ ...prev, hsCode: item.hsCode, name: item.description }))
    setSelectedHs(item)
    setHsDropdownOpen(false)
  }

  const handleSubmit = () => {
    if (!client || !goods.hsCode || !goods.name || goods.declaredValue <= 0) return

    const currentHs = queryHSCode(goods.hsCode)
    if (!currentHs) {
      return
    }
    const category = currentHs.category
    const docs = generateDocuments(category)
    const tax = calculateTax(currentHs.hsCode, goods.declaredValue) || { customsDuty: 0, vat: 0, consumptionTax: 0, total: 0 }

    const newDecl = addDeclaration({
      type: declType,
      status: 'draft',
      goods: [{
        id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
        name: goods.name,
        hsCode: goods.hsCode,
        quantity: goods.quantity,
        unit: goods.unit,
        declaredValue: goods.declaredValue,
        currency: goods.currency,
        origin: goods.origin,
      }],
      totalEstimatedTax: tax,
      documents: docs,
      client,
    })

    navigate('/declarations')
  }

  const handleReuse = (id: string) => {
    const newDecl = reuseDeclaration(id)
    if (newDecl) {
      setReuseModalOpen(false)
      navigate(`/declarations/${newDecl.id}`)
    }
  }

  const recentDeclarations = declarations.slice(0, 10)

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <PageHeader
        title="新建报关单"
        action={
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 text-sm text-navy-500 hover:text-navy-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
        }
      />

      <div className="flex gap-6">
        <div className="flex-1 min-w-0" style={{ flexBasis: '65%' }}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-serif font-semibold text-navy-700 mb-4">基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-2">进出口类型</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="declType"
                      value="import"
                      checked={declType === 'import'}
                      onChange={() => setDeclType('import')}
                      className="w-4 h-4 text-gold-500 focus:ring-gold-500/30 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-navy-700">进口</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="declType"
                      value="export"
                      checked={declType === 'export'}
                      onChange={() => setDeclType('export')}
                      className="w-4 h-4 text-gold-500 focus:ring-gold-500/30 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-navy-700">出口</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">客户名称</label>
                <input
                  type="text"
                  value={client}
                  onChange={e => setClient(e.target.value)}
                  placeholder="请输入客户名称"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-serif font-semibold text-navy-700 mb-4">货物信息</h2>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-navy-600 mb-1">HS编码</label>
                <input
                  ref={hsInputRef}
                  type="text"
                  value={goods.hsCode}
                  onChange={e => handleHsSearch(e.target.value)}
                  onFocus={() => { if (hsResults.length > 0) setHsDropdownOpen(true) }}
                  placeholder="输入HS编码搜索..."
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                />
                {hsDropdownOpen && (
                  <div ref={hsDropdownRef} className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {hsResults.map(item => (
                      <button
                        key={item.hsCode}
                        type="button"
                        onClick={() => handleHsSelect(item)}
                        className="w-full text-left px-4 py-2 hover:bg-gold-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="font-mono text-sm text-navy-700">{item.hsCode}</div>
                        <div className="text-xs text-navy-400">{item.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">品名</label>
                <input
                  type="text"
                  value={goods.name}
                  onChange={e => setGoods(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="货物品名"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-navy-600 mb-1">数量</label>
                  <input
                    type="number"
                    value={goods.quantity || ''}
                    onChange={e => setGoods(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    min={1}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-navy-600 mb-1">单位</label>
                  <select
                    value={goods.unit}
                    onChange={e => setGoods(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                  >
                    {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-navy-600 mb-1">申报价值</label>
                  <input
                    type="number"
                    value={goods.declaredValue || ''}
                    onChange={e => setGoods(prev => ({ ...prev, declaredValue: Number(e.target.value) }))}
                    min={0}
                    placeholder="0.00"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-navy-600 mb-1">币种</label>
                  <select
                    value={goods.currency}
                    onChange={e => setGoods(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                  >
                    {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-600 mb-1">原产地</label>
                <input
                  type="text"
                  value={goods.origin}
                  onChange={e => setGoods(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="原产国/地区"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-serif font-semibold text-navy-700 mb-4">快速复用</h2>
            <p className="text-sm text-navy-400 mb-3">从已有报关单复用信息，快速创建新报关单</p>
            <button
              onClick={() => setReuseModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gold-300 text-gold-600 rounded-lg hover:bg-gold-50 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              选择报关单复用
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors font-medium"
            >
              保存报关单
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-gray-200 text-navy-500 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>

        <div className="w-[35%] min-w-[300px]">
          <div className="sticky top-6">
            <div className="bg-navy-700 rounded-xl p-6 text-white">
              <h3 className="text-lg font-serif font-semibold mb-4 text-gold-300">税费预估</h3>

              {selectedHs ? (
                <div className="space-y-4">
                  <div className="bg-navy-800/50 rounded-lg p-4">
                    <p className="text-xs text-navy-300 mb-1">商品类别</p>
                    <p className="text-sm font-medium">{selectedHs.category}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-navy-200">关税税率</span>
                      <span className="text-sm font-semibold text-gold-300">{(selectedHs.customsDutyRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-navy-200">增值税税率</span>
                      <span className="text-sm font-semibold text-gold-300">{(selectedHs.vatRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-navy-200">消费税税率</span>
                      <span className="text-sm font-semibold text-gold-300">{(selectedHs.consumptionTaxRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="border-t border-navy-600 pt-4 space-y-3">
                    <p className="text-xs text-navy-300 mb-2">预估税费</p>
                    {taxBreakdown ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-navy-200">预估关税</span>
                          <span className="text-sm font-semibold text-gold-400">{formatCurrency(taxBreakdown.customsDuty)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-navy-200">预估增值税</span>
                          <span className="text-sm font-semibold text-gold-400">{formatCurrency(taxBreakdown.vat)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-navy-200">预估消费税</span>
                          <span className="text-sm font-semibold text-gold-400">{formatCurrency(taxBreakdown.consumptionTax)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-navy-600 pt-3 mt-3">
                          <span className="text-sm font-medium">合计</span>
                          <span className="text-lg font-bold text-gold-300">{formatCurrency(taxBreakdown.total)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-navy-400">请输入申报价值以计算税费</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-10 h-10 mx-auto mb-3 text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-navy-400">请选择HS编码</p>
                  <p className="text-xs text-navy-500 mt-1">输入编码后将显示税率信息</p>
                </div>
              )}
            </div>

            {selectedHs && selectedHs.supervisionConditions.length > 0 && (
              <div className="bg-white rounded-xl p-5 mt-4 shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-navy-700 mb-2">监管条件</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHs.supervisionConditions.map((cond, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {reuseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-serif font-semibold text-navy-700">选择报关单复用</h3>
              <button onClick={() => setReuseModalOpen(false)} className="text-navy-400 hover:text-navy-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {recentDeclarations.length === 0 ? (
                <p className="text-center text-navy-400 py-8">暂无可复用的报关单</p>
              ) : (
                <div className="space-y-2">
                  {recentDeclarations.map(d => (
                    <button
                      key={d.id}
                      onClick={() => handleReuse(d.id)}
                      className="w-full text-left p-4 rounded-lg border border-gray-100 hover:border-gold-300 hover:bg-gold-50/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-navy-700">{d.declarationNo}</span>
                        <span className="text-xs text-navy-400">{d.client}</span>
                      </div>
                      <div className="text-sm text-navy-500 mt-1">{d.goods[0]?.name} · {d.goods[0]?.hsCode}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
