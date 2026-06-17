export type DeclarationType = 'import' | 'export'
export type DeclarationStatus = 'draft' | 'submitted' | 'inspecting' | 'released' | 'rejected'
export type DocumentStatus = 'not_prepared' | 'preparing' | 'ready'

export interface HSCodeTaxRate {
  hsCode: string
  description: string
  category: string
  customsDutyRate: number
  vatRate: number
  consumptionTaxRate: number
  supervisionConditions: string[]
}

export interface TaxBreakdown {
  customsDuty: number
  vat: number
  consumptionTax: number
  total: number
}

export interface GoodsItem {
  id: string
  name: string
  hsCode: string
  quantity: number
  unit: string
  declaredValue: number
  currency: string
  origin: string
}

export interface DocumentItem {
  id: string
  name: string
  category: string
  status: DocumentStatus
  required: boolean
  description: string
}

export interface StatusChange {
  status: DeclarationStatus
  timestamp: string
  operator: string
  remark: string
}

export interface Declaration {
  id: string
  declarationNo: string
  type: DeclarationType
  status: DeclarationStatus
  goods: GoodsItem[]
  totalEstimatedTax: TaxBreakdown
  documents: DocumentItem[]
  progressHistory: StatusChange[]
  client: string
  createdAt: string
  updatedAt: string
}

export const STATUS_LABELS: Record<DeclarationStatus, string> = {
  draft: '草稿',
  submitted: '已申报',
  inspecting: '查验中',
  released: '已放行',
  rejected: '退单',
}

export const STATUS_CLASSES: Record<DeclarationStatus, string> = {
  draft: 'status-draft',
  submitted: 'status-submitted',
  inspecting: 'status-inspecting',
  released: 'status-released',
  rejected: 'status-rejected',
}

export const TYPE_LABELS: Record<DeclarationType, string> = {
  import: '进口',
  export: '出口',
}

export const DOC_STATUS_LABELS: Record<DocumentStatus, string> = {
  not_prepared: '未准备',
  preparing: '准备中',
  ready: '已备齐',
}

export const DOC_STATUS_CLASSES: Record<DocumentStatus, string> = {
  not_prepared: 'bg-gray-100 text-gray-600',
  preparing: 'bg-amber-100 text-amber-700',
  ready: 'bg-emerald-100 text-emerald-700',
}
