export interface MetaAdsData {
  data: string
  plataforma: string
  campanha: string
  id_campanha?: string
  impressoes: number
  cliques: number
  alcance?: number
  frequencia?: number
  cpc: number
  ctr: number
  cpm?: number
  gasto: number
  conversoes?: number
  leads: number
  cpl: number
  roas: number
}

export interface VendasData {
  data: string
  equipe: "Órion" | "Fúria"
  vendedor: string
  funcao: "Vendedor" | "Telemarketing"
  ligacoes: number
  conexoes: number
  agendamentos: number
  vendas: number
  valor_vendas: number
}

export interface KPIData {
  roi_geral: number
  custo_por_venda: number
  conversao_lead_venda: number
  faturamento_total: number
  taxa_conexao: number
  taxa_agendamento: number
  taxa_conversao: number
  ticket_medio: number
}
