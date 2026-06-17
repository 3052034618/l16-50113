import { create } from 'zustand'
import type { Declaration, DeclarationStatus, DocumentItem, DocumentStatus, GoodsItem, HSCodeTaxRate, TaxBreakdown } from '@/types'
import { hsCodeDB, documentTemplates, generateMockDeclarations, generateId } from '@/data/mockData'

interface CustomsStore {
  declarations: Declaration[]
  hsCodeDB: HSCodeTaxRate[]

  init: () => void
  addDeclaration: (decl: Omit<Declaration, 'id' | 'declarationNo' | 'progressHistory' | 'createdAt' | 'updatedAt'>) => Declaration
  updateDeclaration: (id: string, updates: Partial<Declaration>) => void
  updateStatus: (id: string, newStatus: DeclarationStatus, remark: string) => void
  updateDocumentStatus: (declId: string, docId: string, status: DocumentStatus) => void
  deleteDeclaration: (id: string) => void
  getDeclaration: (id: string) => Declaration | undefined
  queryHSCode: (code: string) => HSCodeTaxRate | undefined
  searchHSCode: (keyword: string) => HSCodeTaxRate[]
  calculateTax: (hsCode: string, declaredValue: number) => TaxBreakdown | null
  generateDocuments: (category: string) => DocumentItem[]
  reuseDeclaration: (id: string) => Declaration | null
}

const STORAGE_KEY = 'customs_declaration_data'

function loadFromStorage(): Declaration[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return null
}

function saveToStorage(declarations: Declaration[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(declarations))
  } catch { /* ignore */ }
}

function getNextDeclNo(declarations: Declaration[]): string {
  const maxNum = declarations.reduce((max, d) => {
    const numStr = d.declarationNo.replace('BG', '')
    const num = parseInt(numStr.slice(2), 10)
    return num > max ? num : max
  }, 0)
  return `BG25${String(maxNum + 1).padStart(4, '0')}`
}

export const useCustomsStore = create<CustomsStore>((set, get) => ({
  declarations: [],
  hsCodeDB,

  init: () => {
    const stored = loadFromStorage()
    const declarations = stored || generateMockDeclarations()
    if (!stored) saveToStorage(declarations)
    set({ declarations })
  },

  addDeclaration: (declData) => {
    const { declarations } = get()
    const now = new Date().toISOString()
    const newDecl: Declaration = {
      ...declData,
      id: generateId(),
      declarationNo: getNextDeclNo(declarations),
      progressHistory: [{ status: 'draft', timestamp: now, operator: '当前用户', remark: '创建报关单' }],
      createdAt: now.split('T')[0],
      updatedAt: now.split('T')[0],
    }
    const updated = [newDecl, ...declarations]
    saveToStorage(updated)
    set({ declarations: updated })
    return newDecl
  },

  updateDeclaration: (id, updates) => {
    const { declarations } = get()
    const updated = declarations.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : d)
    saveToStorage(updated)
    set({ declarations: updated })
  },

  updateStatus: (id, newStatus, remark) => {
    const { declarations } = get()
    const now = new Date().toISOString()
    const updated = declarations.map(d => {
      if (d.id !== id) return d
      return {
        ...d,
        status: newStatus,
        updatedAt: now.split('T')[0],
        progressHistory: [...d.progressHistory, { status: newStatus, timestamp: now, operator: '当前用户', remark }],
      }
    })
    saveToStorage(updated)
    set({ declarations: updated })
  },

  updateDocumentStatus: (declId, docId, status) => {
    const { declarations } = get()
    const updated = declarations.map(d => {
      if (d.id !== declId) return d
      return {
        ...d,
        documents: d.documents.map(doc => doc.id === docId ? { ...doc, status } : doc),
        updatedAt: new Date().toISOString().split('T')[0],
      }
    })
    saveToStorage(updated)
    set({ declarations: updated })
  },

  deleteDeclaration: (id) => {
    const { declarations } = get()
    const updated = declarations.filter(d => d.id !== id)
    saveToStorage(updated)
    set({ declarations: updated })
  },

  getDeclaration: (id) => {
    return get().declarations.find(d => d.id === id)
  },

  queryHSCode: (code) => {
    return get().hsCodeDB.find(h => h.hsCode === code)
  },

  searchHSCode: (keyword) => {
    const k = keyword.toLowerCase()
    return get().hsCodeDB.filter(h =>
      h.hsCode.includes(k) || h.description.toLowerCase().includes(k)
    )
  },

  calculateTax: (hsCode, declaredValue) => {
    const hsItem = get().hsCodeDB.find(h => h.hsCode === hsCode)
    if (!hsItem) return null
    const customsDuty = declaredValue * hsItem.customsDutyRate
    const vat = (declaredValue + customsDuty) * hsItem.vatRate
    const consumptionTax = hsItem.consumptionTaxRate > 0
      ? (declaredValue + customsDuty + vat) / (1 - hsItem.consumptionTaxRate) * hsItem.consumptionTaxRate
      : 0
    return {
      customsDuty: Math.round(customsDuty * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      consumptionTax: Math.round(consumptionTax * 100) / 100,
      total: Math.round((customsDuty + vat + consumptionTax) * 100) / 100,
    }
  },

  generateDocuments: (category) => {
    const template = documentTemplates[category] || documentTemplates['default']
    return template.map(d => ({
      ...d,
      id: generateId(),
      status: 'not_prepared' as DocumentStatus,
    }))
  },

  reuseDeclaration: (id) => {
    const source = get().declarations.find(d => d.id === id)
    if (!source) return null
    const newGoods: GoodsItem[] = source.goods.map(g => ({ ...g, id: generateId() }))
    const newDocs: DocumentItem[] = source.documents.map(d => ({ ...d, id: generateId(), status: 'not_prepared' }))
    const { declarations } = get()
    const now = new Date().toISOString()
    const newDecl: Declaration = {
      id: generateId(),
      declarationNo: getNextDeclNo(declarations),
      type: source.type,
      status: 'draft',
      goods: newGoods,
      totalEstimatedTax: { ...source.totalEstimatedTax },
      documents: newDocs,
      progressHistory: [{ status: 'draft', timestamp: now, operator: '当前用户', remark: `从报关单 ${source.declarationNo} 复用创建` }],
      client: source.client,
      createdAt: now.split('T')[0],
      updatedAt: now.split('T')[0],
    }
    const updated = [newDecl, ...declarations]
    saveToStorage(updated)
    set({ declarations: updated })
    return newDecl
  },
}))
