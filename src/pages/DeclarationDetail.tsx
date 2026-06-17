import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCustomsStore } from '@/store/useCustomsStore'
import { STATUS_LABELS, TYPE_LABELS } from '@/types'
import type { DeclarationStatus, DocumentStatus } from '@/types'
import { StatusBadge, DocStatusBadge, PageHeader, formatCurrency, formatDate, formatDateTime } from '@/components/UI'

const statusFlow: Record<DeclarationStatus, { next: DeclarationStatus; label: string }[]> = {
  draft: [{ next: 'submitted', label: '提交申报' }],
  submitted: [{ next: 'inspecting', label: '进入查验' }],
  inspecting: [
    { next: 'released', label: '查验放行' },
    { next: 'rejected', label: '退单处理' },
  ],
  released: [],
  rejected: [{ next: 'draft', label: '重新编辑' }],
}

const nextDocStatus: Record<DocumentStatus, DocumentStatus> = {
  not_prepared: 'preparing',
  preparing: 'ready',
  ready: 'not_prepared',
}

const timelineIcons: Record<DeclarationStatus, string> = {
  draft: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  submitted: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  inspecting: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  released: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  rejected: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
}

export default function DeclarationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getDeclaration = useCustomsStore(s => s.getDeclaration)
  const updateStatus = useCustomsStore(s => s.updateStatus)
  const updateDocumentStatus = useCustomsStore(s => s.updateDocumentStatus)
  const deleteDeclaration = useCustomsStore(s => s.deleteDeclaration)

  const [confirmAction, setConfirmAction] = useState<{ status: DeclarationStatus; label: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [statusRemark, setStatusRemark] = useState('')

  const declaration = id ? getDeclaration(id) : undefined

  if (!declaration) {
    return (
      <div className="p-6 max-w-[1440px] mx-auto">
        <PageHeader title="报关单详情" />
        <div className="text-center py-16">
          <p className="text-navy-400">未找到该报关单</p>
          <Link to="/declarations" className="text-gold-600 hover:text-gold-700 text-sm mt-2 inline-block">返回列表</Link>
        </div>
      </div>
    )
  }

  const handleStatusChange = (nextStatus: DeclarationStatus, label: string) => {
    setConfirmAction({ status: nextStatus, label })
    setStatusRemark('')
  }

  const confirmStatusChange = () => {
    if (confirmAction && id) {
      updateStatus(id, confirmAction.status, statusRemark || confirmAction.label)
      setConfirmAction(null)
      setStatusRemark('')
    }
  }

  const handleDelete = () => {
    if (id) {
      deleteDeclaration(id)
      navigate('/declarations')
    }
  }

  const handleDocStatusToggle = (docId: string, currentStatus: DocumentStatus) => {
    if (id) {
      updateDocumentStatus(id, docId, nextDocStatus[currentStatus])
    }
  }

  const actions = statusFlow[declaration.status]

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <PageHeader
        title="报关单详情"
        subtitle={`${declaration.declarationNo}`}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={declaration.status} />
            <Link
              to="/declarations"
              className="text-sm text-navy-400 hover:text-navy-600 transition-colors"
            >
              返回列表
            </Link>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-navy-700 mb-4">基本信息</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-navy-400 mb-1">报关单号</p>
            <p className="text-sm font-mono text-navy-700">{declaration.declarationNo}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 mb-1">进出口类型</p>
            <p className="text-sm text-navy-700">{TYPE_LABELS[declaration.type]}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 mb-1">客户名称</p>
            <p className="text-sm text-navy-700">{declaration.client}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 mb-1">创建时间</p>
            <p className="text-sm text-navy-700">{formatDate(declaration.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 mb-1">更新时间</p>
            <p className="text-sm text-navy-700">{formatDate(declaration.updatedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400 mb-1">当前状态</p>
            <p className="text-sm text-navy-700">{STATUS_LABELS[declaration.status]}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-navy-700 mb-4">货物信息</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-50 text-navy-600">
              <th className="text-left px-4 py-2.5 font-medium">品名</th>
              <th className="text-left px-4 py-2.5 font-medium">HS编码</th>
              <th className="text-right px-4 py-2.5 font-medium">数量</th>
              <th className="text-left px-4 py-2.5 font-medium">单位</th>
              <th className="text-right px-4 py-2.5 font-medium">申报价值</th>
              <th className="text-left px-4 py-2.5 font-medium">币种</th>
              <th className="text-left px-4 py-2.5 font-medium">原产地</th>
            </tr>
          </thead>
          <tbody>
            {declaration.goods.map(g => (
              <tr key={g.id} className="border-t border-gray-50">
                <td className="px-4 py-3 text-navy-700">{g.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{g.hsCode}</td>
                <td className="px-4 py-3 text-right">{g.quantity}</td>
                <td className="px-4 py-3">{g.unit}</td>
                <td className="px-4 py-3 text-right text-navy-700">{formatCurrency(g.declaredValue, g.currency)}</td>
                <td className="px-4 py-3">{g.currency}</td>
                <td className="px-4 py-3">{g.origin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-navy-700 rounded-xl p-6 mb-6 text-white">
        <h3 className="text-lg font-serif font-semibold mb-4 text-gold-300">税费明细</h3>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-navy-300 mb-1">关税</p>
            <p className="text-lg font-semibold text-gold-400">{formatCurrency(declaration.totalEstimatedTax.customsDuty)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-300 mb-1">增值税</p>
            <p className="text-lg font-semibold text-gold-400">{formatCurrency(declaration.totalEstimatedTax.vat)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-300 mb-1">消费税</p>
            <p className="text-lg font-semibold text-gold-400">{formatCurrency(declaration.totalEstimatedTax.consumptionTax)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-300 mb-1">合计</p>
            <p className="text-2xl font-bold text-gold-300">{formatCurrency(declaration.totalEstimatedTax.total)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-navy-700 mb-4">随附单证</h2>
        <div className="space-y-2">
          {declaration.documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-50"
              onClick={() => handleDocStatusToggle(doc.id, doc.status)}
            >
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-sm font-medium text-navy-700">{doc.name}</span>
                  {doc.required && <span className="ml-2 text-xs text-red-500">*必填</span>}
                </div>
                <span className="text-xs text-navy-400">{doc.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-navy-400">{doc.description}</span>
                <DocStatusBadge status={doc.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-navy-700 mb-4">流程记录</h2>
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-navy-100" />
          {declaration.progressHistory.map((record, idx) => (
            <div key={idx} className="relative mb-6 last:mb-0">
              <div className={`absolute -left-5 w-6 h-6 rounded-full flex items-center justify-center ${
                idx === declaration.progressHistory.length - 1 ? 'bg-gold-500' : 'bg-navy-200'
              }`}>
                <svg className={`w-3 h-3 ${idx === declaration.progressHistory.length - 1 ? 'text-white' : 'text-navy-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={timelineIcons[record.status]} />
                </svg>
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-navy-700">{STATUS_LABELS[record.status]}</span>
                  <span className="text-xs text-navy-400">{record.operator}</span>
                </div>
                <p className="text-xs text-navy-400 mt-0.5">{formatDateTime(record.timestamp)}</p>
                {record.remark && <p className="text-sm text-navy-500 mt-1">{record.remark}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-serif font-semibold text-navy-700 mb-4">状态操作</h2>
          <div className="flex flex-wrap gap-3">
            {actions.map(action => (
              <button
                key={action.next}
                onClick={() => handleStatusChange(action.next, action.label)}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  action.next === 'rejected'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    : action.next === 'released'
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-gold-500 text-white hover:bg-gold-600'
                }`}
              >
                {action.label}
              </button>
            ))}
            {declaration.status === 'released' && (
              <button
                onClick={() => navigate('/archive')}
                className="px-5 py-2.5 rounded-lg font-medium text-sm bg-navy-700 text-white hover:bg-navy-800 transition-colors"
              >
                归档
              </button>
            )}
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-5 py-2.5 rounded-lg font-medium text-sm text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      )}

      {declaration.status === 'released' && actions.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-semibold text-navy-700">已完成</h2>
              <p className="text-sm text-navy-400 mt-1">该报关单已放行，可进行归档或删除操作</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/archive')}
                className="px-5 py-2.5 rounded-lg font-medium text-sm bg-navy-700 text-white hover:bg-navy-800 transition-colors"
              >
                归档
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-5 py-2.5 rounded-lg font-medium text-sm text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-serif font-semibold text-navy-700 mb-2">确认操作</h3>
            <p className="text-sm text-navy-500 mb-4">
              确定要将报关单 <span className="font-mono font-medium">{declaration.declarationNo}</span> 的状态变更为
              <span className="font-medium text-navy-700 mx-1">{STATUS_LABELS[confirmAction.status]}</span>吗？
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-navy-600 mb-1">备注</label>
              <input
                type="text"
                value={statusRemark}
                onChange={e => setStatusRemark(e.target.value)}
                placeholder={confirmAction.label}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm text-navy-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmStatusChange}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  confirmAction.status === 'rejected'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gold-500 text-white hover:bg-gold-600'
                }`}
              >
                确认{confirmAction.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-serif font-semibold text-red-600 mb-2">确认删除</h3>
            <p className="text-sm text-navy-500 mb-4">
              确定要删除报关单 <span className="font-mono font-medium">{declaration.declarationNo}</span> 吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm text-navy-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
