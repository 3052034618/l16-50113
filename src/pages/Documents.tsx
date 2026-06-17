import { useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { FileText, FolderOpen, ChevronRight, Download } from 'lucide-react'
import { useCustomsStore } from '@/store/useCustomsStore'
import type { DocumentStatus } from '@/types'
import { DOC_STATUS_LABELS } from '@/types'
import { PageHeader, DocStatusBadge } from '@/components/UI'

const STATUS_CYCLE: DocumentStatus[] = ['not_prepared', 'preparing', 'ready']

const CATEGORY_ORDER = ['贸易单据', '运输单据', '合规证书', '监管证件', '优惠单据', '检验检疫']

export default function Documents() {
  const declarations = useCustomsStore(s => s.declarations)
  const updateDocumentStatus = useCustomsStore(s => s.updateDocumentStatus)
  const [selectedDeclId, setSelectedDeclId] = useState<string>('')

  const selectedDecl = declarations.find(d => d.id === selectedDeclId)

  const grouped = (() => {
    if (!selectedDecl) return {}
    const map: Record<string, typeof selectedDecl.documents> = {}
    for (const doc of selectedDecl.documents) {
      if (!map[doc.category]) map[doc.category] = []
      map[doc.category].push(doc)
    }
    return map
  })()

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a)
    const bi = CATEGORY_ORDER.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  const totalDocs = selectedDecl?.documents.length ?? 0
  const readyDocs = selectedDecl?.documents.filter(d => d.status === 'ready').length ?? 0
  const progressPercent = totalDocs > 0 ? Math.round((readyDocs / totalDocs) * 100) : 0

  function handleCycleStatus(declId: string, docId: string, current: DocumentStatus) {
    const idx = STATUS_CYCLE.indexOf(current)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    updateDocumentStatus(declId, docId, next)
  }

  async function handlePackageDownload() {
    if (!selectedDecl) return
    const zip = new JSZip()
    const manifestLines = [
      `报关资料清单 - ${selectedDecl.declarationNo}`,
      `客户：${selectedDecl.client}`,
      `生成时间：${new Date().toLocaleString('zh-CN')}`,
      '',
      '单据列表：',
    ]
    for (const doc of selectedDecl.documents) {
      manifestLines.push(`  - ${doc.name} | ${DOC_STATUS_LABELS[doc.status]} | ${doc.required ? '必填' : '选填'}`)
      if (doc.status === 'ready') {
        zip.file(`${doc.name}.txt`, `${doc.name}\n\n状态：已备齐\n${doc.description}\n\n报关单号：${selectedDecl.declarationNo}\n客户：${selectedDecl.client}`)
      }
    }
    zip.file('单据清单.txt', manifestLines.join('\n'))
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `报关资料包_${selectedDecl.declarationNo}.zip`)
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <PageHeader
        title="单据中心"
        subtitle="管理报关所需单据，追踪备齐状态"
        action={
          selectedDecl ? (
            <button
              onClick={handlePackageDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              打包下载
            </button>
          ) : undefined
        }
      />

      <div className="mb-6">
        <select
          value={selectedDeclId}
          onChange={e => setSelectedDeclId(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-navy-200 rounded-lg bg-white text-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
        >
          <option value="">请选择报关单</option>
          {declarations.map(d => (
            <option key={d.id} value={d.id}>
              {d.declarationNo} - {d.client}
            </option>
          ))}
        </select>
      </div>

      {!selectedDecl ? (
        <div className="flex flex-col items-center justify-center py-20 text-navy-300">
          <FolderOpen className="w-16 h-16 mb-4" />
          <h3 className="text-lg font-medium text-navy-400 mb-1">请选择报关单</h3>
          <p className="text-sm">从上方下拉框选择一份报关单以查看和管理单据</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-navy-100 p-5">
              <p className="text-sm text-navy-400 mb-1">单据总数</p>
              <p className="text-2xl font-serif font-semibold text-navy-700">{totalDocs}</p>
            </div>
            <div className="bg-white rounded-xl border border-navy-100 p-5">
              <p className="text-sm text-navy-400 mb-1">已备齐</p>
              <p className="text-2xl font-serif font-semibold text-emerald-600">{readyDocs}</p>
            </div>
            <div className="bg-white rounded-xl border border-navy-100 p-5">
              <p className="text-sm text-navy-400 mb-1">备齐进度</p>
              <p className="text-2xl font-serif font-semibold text-gold-500 mb-2">{progressPercent}%</p>
              <div className="w-full h-2 bg-navy-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {sortedCategories.map(category => (
            <div key={category} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-navy-400" />
                <h2 className="text-base font-serif font-semibold text-navy-600">{category}</h2>
                <span className="text-xs text-navy-300">({grouped[category].length})</span>
              </div>
              <div className="space-y-2">
                {grouped[category].map(doc => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-lg border border-navy-100 px-5 py-4 flex items-center justify-between hover:border-navy-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-navy-700">{doc.name}</span>
                        {doc.required ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600">
                            必填
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-navy-50 text-navy-400">
                            选填
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-navy-300 truncate">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <DocStatusBadge status={doc.status} />
                      <button
                        onClick={() => handleCycleStatus(selectedDecl.id, doc.id, doc.status)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-navy-500 bg-navy-50 rounded-md hover:bg-navy-100 transition-colors"
                      >
                        {doc.status === 'not_prepared' ? '开始准备' : doc.status === 'preparing' ? '标记备齐' : '重置状态'}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
