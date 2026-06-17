import type { HSCodeTaxRate, Declaration, DocumentItem, StatusChange } from '@/types'

export const hsCodeDB: HSCodeTaxRate[] = [
  { hsCode: '8471300000', description: '便携式自动数据处理设备（笔记本电脑）', category: '电子产品', customsDutyRate: 0, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: ['3C认证', '进口许可证'] },
  { hsCode: '8517120000', description: '电话机（智能手机）', category: '电子产品', customsDutyRate: 0, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: ['3C认证', '入网许可'] },
  { hsCode: '8542310000', description: '集成电路（处理器及控制器）', category: '电子产品', customsDutyRate: 0, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: ['进口许可证'] },
  { hsCode: '2709000000', description: '石油原油', category: '能源', customsDutyRate: 0, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: ['自动进口许可证'] },
  { hsCode: '2701120000', description: '烟煤', category: '能源', customsDutyRate: 0.03, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: ['自动进口许可证'] },
  { hsCode: '2601110000', description: '铁矿石（非烧结）', category: '矿产', customsDutyRate: 0, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: ['自动进口许可证'] },
  { hsCode: '7207110000', description: '矩形截面铁或非合金钢半成品', category: '钢材', customsDutyRate: 0.02, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: [] },
  { hsCode: '7208390000', description: '热轧钢板（厚度<3mm）', category: '钢材', customsDutyRate: 0.03, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: [] },
  { hsCode: '1005100000', description: '玉米种用', category: '农产品', customsDutyRate: 0, vatRate: 0.09, consumptionTaxRate: 0, supervisionConditions: ['检疫审批', '进口许可证'] },
  { hsCode: '1006300000', description: '大米（精米）', category: '农产品', customsDutyRate: 0.01, vatRate: 0.09, consumptionTaxRate: 0, supervisionConditions: ['配额管理', '检疫审批'] },
  { hsCode: '5201000001', description: '未梳棉花', category: '农产品', customsDutyRate: 0.04, vatRate: 0.09, consumptionTaxRate: 0, supervisionConditions: ['配额管理', '滑准税'] },
  { hsCode: '2204210000', description: '葡萄酒（容器≤2L）', category: '食品饮料', customsDutyRate: 0.14, vatRate: 0.13, consumptionTaxRate: 0.10, supervisionConditions: ['卫生证书'] },
  { hsCode: '2203000000', description: '麦芽酿造的啤酒', category: '食品饮料', customsDutyRate: 0, vatRate: 0.13, consumptionTaxRate: 0.10, supervisionConditions: ['卫生证书'] },
  { hsCode: '2402200000', description: '烟草制的卷烟', category: '烟草', customsDutyRate: 0.25, vatRate: 0.13, consumptionTaxRate: 0.36, supervisionConditions: ['专卖许可', '进口配额'] },
  { hsCode: '6110200000', description: '棉制针织钩编套头衫', category: '纺织品', customsDutyRate: 0.06, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: [] },
  { hsCode: '6203420000', description: '棉制男式长裤', category: '纺织品', customsDutyRate: 0.06, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: [] },
  { hsCode: '6403990000', description: '其他材料制鞋靴', category: '鞋类', customsDutyRate: 0.08, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: [] },
  { hsCode: '9503008900', description: '其他玩具', category: '玩具', customsDutyRate: 0, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: ['3C认证'] },
  { hsCode: '3926900000', description: '其他塑料制品', category: '塑料制品', customsDutyRate: 0.065, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: [] },
  { hsCode: '7318150000', description: '其他螺钉及螺栓', category: '五金', customsDutyRate: 0.08, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: [] },
  { hsCode: '8703230000', description: '汽油型小客车（1500cc<排量≤3000cc）', category: '汽车', customsDutyRate: 0.15, vatRate: 0.13, consumptionTaxRate: 0.05, supervisionConditions: ['3C认证', '进口许可证', '环保达标'] },
  { hsCode: '8703240000', description: '汽油型小客车（排量>3000cc）', category: '汽车', customsDutyRate: 0.15, vatRate: 0.13, consumptionTaxRate: 0.09, supervisionConditions: ['3C认证', '进口许可证', '环保达标'] },
  { hsCode: '8802400000', description: '航空器（飞机）', category: '航空', customsDutyRate: 0.01, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: ['适航证', '进口许可证'] },
  { hsCode: '3004900000', description: '其他已配定剂量的药品', category: '医药', customsDutyRate: 0, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: ['药品注册证', '进口准许证'] },
  { hsCode: '9018900000', description: '其他医疗外科牙科仪器器具', category: '医疗器械', customsDutyRate: 0.04, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: ['医疗器械注册证'] },
  { hsCode: '4703210000', description: '漂白针叶木烧碱法木浆', category: '纸浆', customsDutyRate: 0, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: [] },
  { hsCode: '4811410000', description: '自粘的成卷胶粘纸及纸板', category: '纸品', customsDutyRate: 0.075, vatRate: 0.13, consumptionTaxRate: 0, supervisionConditions: [] },
  { hsCode: '7102390000', description: '其他非工业用钻石', category: '珠宝', customsDutyRate: 0.03, vatRate: 0.13, consumptionTaxRate: 0.05, supervisionConditions: ['金伯利证书'] },
  { hsCode: '9101110000', description: '机械指示式贵金属手表', category: '奢侈品', customsDutyRate: 0.10, vatRate: 0.13, consumptionTaxRate: 0.20, supervisionConditions: [] },
  { hsCode: '3303000000', description: '香水及花露水', category: '化妆品', customsDutyRate: 0.10, vatRate: 0.13, consumptionTaxRate: 0.15, supervisionConditions: ['备案凭证'] },
]

export const documentTemplates: Record<string, Omit<DocumentItem, 'id' | 'status'>[]> = {
  '电子产品': [
    { name: '商业发票', category: '贸易单据', required: true, description: '出口商开具的商业发票' },
    { name: '装箱单', category: '贸易单据', required: true, description: '详细列明货物包装情况' },
    { name: '贸易合同', category: '贸易单据', required: true, description: '买卖双方签订的贸易合同' },
    { name: '提单/运单', category: '运输单据', required: true, description: '承运人签发的运输单据' },
    { name: '3C认证证书', category: '合规证书', required: true, description: '中国强制性产品认证证书' },
    { name: '进口许可证', category: '监管证件', required: true, description: '商务部门签发的进口许可证' },
    { name: '原产地证书', category: '优惠单据', required: false, description: '享受协定税率的产地证' },
    { name: '报检单', category: '检验检疫', required: true, description: '出入境检验检疫报检单' },
  ],
  '农产品': [
    { name: '商业发票', category: '贸易单据', required: true, description: '出口商开具的商业发票' },
    { name: '装箱单', category: '贸易单据', required: true, description: '详细列明货物包装情况' },
    { name: '贸易合同', category: '贸易单据', required: true, description: '买卖双方签订的贸易合同' },
    { name: '提单/运单', category: '运输单据', required: true, description: '承运人签发的运输单据' },
    { name: '检疫审批证书', category: '检验检疫', required: true, description: '进出境动植物检疫审批' },
    { name: '进口配额证明', category: '监管证件', required: false, description: '配额商品进口证明' },
    { name: '原产地证书', category: '优惠单据', required: false, description: '享受协定税率的产地证' },
    { name: '植检证书', category: '检验检疫', required: true, description: '植物检疫证书' },
  ],
  '食品饮料': [
    { name: '商业发票', category: '贸易单据', required: true, description: '出口商开具的商业发票' },
    { name: '装箱单', category: '贸易单据', required: true, description: '详细列明货物包装情况' },
    { name: '贸易合同', category: '贸易单据', required: true, description: '买卖双方签订的贸易合同' },
    { name: '提单/运单', category: '运输单据', required: true, description: '承运人签发的运输单据' },
    { name: '卫生证书', category: '检验检疫', required: true, description: '出口国官方卫生证书' },
    { name: '中文标签备案', category: '合规证书', required: true, description: '进口食品中文标签备案' },
    { name: '原产地证书', category: '优惠单据', required: false, description: '享受协定税率的产地证' },
  ],
  '纺织品': [
    { name: '商业发票', category: '贸易单据', required: true, description: '出口商开具的商业发票' },
    { name: '装箱单', category: '贸易单据', required: true, description: '详细列明货物包装情况' },
    { name: '贸易合同', category: '贸易单据', required: true, description: '买卖双方签订的贸易合同' },
    { name: '提单/运单', category: '运输单据', required: true, description: '承运人签发的运输单据' },
    { name: '原产地证书', category: '优惠单据', required: false, description: '享受协定税率的产地证' },
    { name: '品质检验证书', category: '检验检疫', required: false, description: '纺织品品质检验报告' },
  ],
  '汽车': [
    { name: '商业发票', category: '贸易单据', required: true, description: '出口商开具的商业发票' },
    { name: '装箱单', category: '贸易单据', required: true, description: '详细列明货物包装情况' },
    { name: '贸易合同', category: '贸易单据', required: true, description: '买卖双方签订的贸易合同' },
    { name: '提单/运单', category: '运输单据', required: true, description: '承运人签发的运输单据' },
    { name: '3C认证证书', category: '合规证书', required: true, description: '中国强制性产品认证证书' },
    { name: '进口许可证', category: '监管证件', required: true, description: '商务部门签发的进口许可证' },
    { name: '环保达标证明', category: '合规证书', required: true, description: '机动车环保信息随车清单' },
    { name: '车辆一致性证书', category: '合规证书', required: true, description: '车辆一致性证书' },
  ],
  'default': [
    { name: '商业发票', category: '贸易单据', required: true, description: '出口商开具的商业发票' },
    { name: '装箱单', category: '贸易单据', required: true, description: '详细列明货物包装情况' },
    { name: '贸易合同', category: '贸易单据', required: true, description: '买卖双方签订的贸易合同' },
    { name: '提单/运单', category: '运输单据', required: true, description: '承运人签发的运输单据' },
    { name: '原产地证书', category: '优惠单据', required: false, description: '享受协定税率的产地证' },
  ],
}

function generateDeclNo(idx: number): string {
  return `BG${String(2024).slice(2)}${String(idx).padStart(4, '0')}`
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

const clients = ['华信国际贸易', '东方进出口集团', '鼎盛贸易公司', '利丰供应链', '中远达商贸', '嘉禾国际']
const origins = ['美国', '日本', '德国', '韩国', '澳大利亚', '巴西', '越南', '泰国', '印度', '马来西亚']

export function generateMockDeclarations(): Declaration[] {
  const results: Declaration[] = []
  const statuses: Declaration['status'][] = ['draft', 'submitted', 'inspecting', 'released', 'rejected']
  const types: Declaration['type'][] = ['import', 'export']
  const units = ['台', '千克', '吨', '件', '个', '箱', '套', '米']

  for (let i = 1; i <= 25; i++) {
    const hsItem = hsCodeDB[i % hsCodeDB.length]
    const type = types[i % 2]
    const statusIdx = i <= 15 ? Math.min(Math.floor(i / 3), 4) : Math.floor(Math.random() * 5)
    const status = statuses[statusIdx]
    const quantity = Math.floor(Math.random() * 900) + 100
    const declaredValue = Math.floor(Math.random() * 500000) + 10000
    const customsDuty = declaredValue * hsItem.customsDutyRate
    const vat = (declaredValue + customsDuty) * hsItem.vatRate
    const consumptionTax = hsItem.consumptionTaxRate > 0 ? (declaredValue + customsDuty + vat) / (1 - hsItem.consumptionTaxRate) * hsItem.consumptionTaxRate : 0
    const total = customsDuty + vat + consumptionTax

    const month = Math.floor(Math.random() * 12) + 1
    const day = Math.floor(Math.random() * 28) + 1
    const createdDate = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const updatedDate = new Date(new Date(createdDate).getTime() + Math.random() * 7 * 86400000).toISOString().split('T')[0]

    const progressHistory: StatusChange[] = [{ status: 'draft', timestamp: createdDate + 'T09:00:00Z', operator: '操作员A', remark: '创建报关单' }]
    if (statusIdx >= 1) progressHistory.push({ status: 'submitted', timestamp: createdDate + 'T14:00:00Z', operator: '操作员A', remark: '提交申报' })
    if (statusIdx >= 2) progressHistory.push({ status: 'inspecting', timestamp: updatedDate + 'T10:00:00Z', operator: '海关', remark: '进入查验环节' })
    if (statusIdx >= 3 && status === 'released') progressHistory.push({ status: 'released', timestamp: updatedDate + 'T16:00:00Z', operator: '海关', remark: '查验通过，予以放行' })
    if (statusIdx >= 4 && status === 'rejected') progressHistory.push({ status: 'rejected', timestamp: updatedDate + 'T11:00:00Z', operator: '海关', remark: '单证不全，退单处理' })

    const docTemplate = documentTemplates[hsItem.category] || documentTemplates['default']
    const docs = docTemplate.map(d => ({
      id: generateId(),
      ...d,
      status: (Math.random() > 0.3 ? 'ready' : Math.random() > 0.5 ? 'preparing' : 'not_prepared') as DocumentItem['status'],
    }))

    results.push({
      id: generateId(),
      declarationNo: generateDeclNo(i),
      type,
      status,
      goods: [{
        id: generateId(),
        name: hsItem.description,
        hsCode: hsItem.hsCode,
        quantity,
        unit: units[i % units.length],
        declaredValue,
        currency: 'USD',
        origin: origins[i % origins.length],
      }],
      totalEstimatedTax: { customsDuty: Math.round(customsDuty * 100) / 100, vat: Math.round(vat * 100) / 100, consumptionTax: Math.round(consumptionTax * 100) / 100, total: Math.round(total * 100) / 100 },
      documents: docs,
      progressHistory,
      client: clients[i % clients.length],
      createdAt: createdDate,
      updatedAt: updatedDate,
    })
  }
  return results
}

export { generateId }
