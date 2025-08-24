import type { MetaAdsData, VendasData, KPIData } from "./types"

export function calculateKPIs(metaAds: MetaAdsData[], orionData: VendasData[], furiaData: VendasData[]): KPIData {
  // Meta Ads totals
  const totalGasto = metaAds.reduce((sum, item) => sum + item.gasto, 0)
  const totalLeads = metaAds.reduce((sum, item) => sum + item.leads, 0)

  // Sales totals
  const allSalesData = [...orionData, ...furiaData]
  const totalVendas = allSalesData.reduce((sum, item) => sum + item.vendas, 0)
  const faturamentoTotal = allSalesData.reduce((sum, item) => sum + item.valor_vendas, 0)
  const totalLigacoes = allSalesData.reduce((sum, item) => sum + item.ligacoes, 0)
  const totalConexoes = allSalesData.reduce((sum, item) => sum + item.conexoes, 0)
  const totalAgendamentos = allSalesData.reduce((sum, item) => sum + item.agendamentos, 0)

  // Calculate KPIs
  const roi_geral = totalGasto > 0 ? ((faturamentoTotal - totalGasto) / totalGasto) * 100 : 0
  const custo_por_venda = totalVendas > 0 ? totalGasto / totalVendas : 0
  const conversao_lead_venda = totalLeads > 0 ? (totalVendas / totalLeads) * 100 : 0
  const taxa_conexao = totalLigacoes > 0 ? (totalConexoes / totalLigacoes) * 100 : 0
  const taxa_agendamento = totalConexoes > 0 ? (totalAgendamentos / totalConexoes) * 100 : 0
  const taxa_conversao = totalAgendamentos > 0 ? (totalVendas / totalAgendamentos) * 100 : 0
  const ticket_medio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0

  return {
    roi_geral,
    custo_por_venda,
    conversao_lead_venda,
    faturamento_total: faturamentoTotal,
    taxa_conexao,
    taxa_agendamento,
    taxa_conversao,
    ticket_medio,
  }
}

export function calculateTeamKPIs(teamData: VendasData[]) {
  const totalLigacoes = teamData.reduce((sum, item) => sum + item.ligacoes, 0)
  const totalConexoes = teamData.reduce((sum, item) => sum + item.conexoes, 0)
  const totalAgendamentos = teamData.reduce((sum, item) => sum + item.agendamentos, 0)
  const totalVendas = teamData.reduce((sum, item) => sum + item.vendas, 0)
  const totalFaturamento = teamData.reduce((sum, item) => sum + item.valor_vendas, 0)

  return {
    totalLigacoes,
    totalConexoes,
    totalAgendamentos,
    totalVendas,
    totalFaturamento,
    taxaConexao: totalLigacoes > 0 ? (totalConexoes / totalLigacoes) * 100 : 0,
    taxaAgendamento: totalConexoes > 0 ? (totalAgendamentos / totalConexoes) * 100 : 0,
    taxaConversao: totalAgendamentos > 0 ? (totalVendas / totalAgendamentos) * 100 : 0,
    ticketMedio: totalVendas > 0 ? totalFaturamento / totalVendas : 0,
  }
}
