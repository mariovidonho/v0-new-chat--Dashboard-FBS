"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Briefcase,
  PhoneCall,
  RotateCcw,
  Loader2,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  ComposedChart,
} from "recharts"
import type { MetaAdsData, VendasData } from "@/lib/types"
import { calculateKPIs, calculateTeamKPIs } from "@/lib/calculations"

export default function FBSPrimeDashboard() {
  const [metaAdsData, setMetaAdsData] = useState<MetaAdsData[]>([])
  const [orionData, setOrionData] = useState<VendasData[]>([])
  const [furiaData, setFuriaData] = useState<VendasData[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("7")
  const [selectedTeam, setSelectedTeam] = useState("consolidado")
  const [selectedRole, setSelectedRole] = useState("todos")
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isFiltering, setIsFiltering] = useState(false)

  const loadData = async () => {
    try {
      const [metaResponse, orionResponse, furiaResponse] = await Promise.all([
        fetch("/api/meta-ads"),
        fetch("/api/vendas-orion"),
        fetch("/api/vendas-furia"),
      ])

      const metaData = await metaResponse.json()
      const orionDataRes = await orionResponse.json()
      const furiaDataRes = await furiaResponse.json()

      setMetaAdsData(metaData)
      setOrionData(orionDataRes)
      setFuriaData(furiaDataRes)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  const refreshMetaAdsData = async () => {
    try {
      const response = await fetch("/api/meta-ads")
      const metaData = await response.json()
      setMetaAdsData(metaData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Erro ao atualizar dados do Meta Ads:", error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setIsFiltering(true)
    const timer = setTimeout(() => setIsFiltering(false), 300)
    return () => clearTimeout(timer)
  }, [selectedPeriod, selectedTeam, selectedRole])

  const filteredData = useMemo(() => {
    // Period filtering function
    const filterByPeriod = (data: any[], period: string) => {
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today

      switch (period) {
        case "1": // Today
          const startOfToday = new Date(today)
          startOfToday.setHours(0, 0, 0, 0)
          return data.filter((item) => {
            const itemDate = new Date(item.data)
            return itemDate >= startOfToday && itemDate <= today
          })
        case "7": // Last 7 days
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return data.filter((item) => new Date(item.data) >= sevenDaysAgo)
        case "30": // Last 30 days
          const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return data.filter((item) => new Date(item.data) >= thirtyDaysAgo)
        default:
          return data
      }
    }

    // Role filtering function
    const filterByRole = (data: VendasData[], role: string) => {
      if (role === "todos") return data
      return data.filter((item) => item.funcao === role)
    }

    // Apply period filtering to all data
    const filteredMeta = filterByPeriod(metaAdsData, selectedPeriod)
    let filteredOrion = filterByPeriod(orionData, selectedPeriod)
    let filteredFuria = filterByPeriod(furiaData, selectedPeriod)

    // Apply role filtering to sales data
    filteredOrion = filterByRole(filteredOrion, selectedRole)
    filteredFuria = filterByRole(filteredFuria, selectedRole)

    // Apply team filtering
    let finalOrion = filteredOrion
    let finalFuria = filteredFuria

    if (selectedTeam === "orion") {
      finalFuria = []
    } else if (selectedTeam === "furia") {
      finalOrion = []
    }

    return {
      metaAds: filteredMeta,
      orion: finalOrion,
      furia: finalFuria,
    }
  }, [metaAdsData, orionData, furiaData, selectedPeriod, selectedTeam, selectedRole])

  const kpis = useMemo(
    () => calculateKPIs(filteredData.metaAds, filteredData.orion, filteredData.furia),
    [filteredData],
  )
  const orionKPIs = useMemo(() => calculateTeamKPIs(filteredData.orion), [filteredData.orion])
  const furiaKPIs = useMemo(() => calculateTeamKPIs(filteredData.furia), [filteredData.furia])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`
    }
    return formatCurrency(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getDynamicTitle = () => {
    let title = "FBS Prime"

    if (selectedTeam === "orion") {
      title += " - Equipe Órion"
    } else if (selectedTeam === "furia") {
      title += " - Equipe Fúria"
    } else if (selectedTeam === "comparativo") {
      title += " - Órion vs Fúria"
    }

    if (selectedRole === "Vendedor") {
      title += " - Vendedores"
    } else if (selectedRole === "Telemarketing") {
      title += " - Telemarketing"
    }

    return title
  }

  const getBreadcrumb = () => {
    const parts = ["FBS Prime"]

    if (selectedTeam !== "consolidado") {
      if (selectedTeam === "orion") parts.push("Órion")
      else if (selectedTeam === "furia") parts.push("Fúria")
      else if (selectedTeam === "comparativo") parts.push("Comparativo")
    }

    if (selectedRole !== "todos") {
      parts.push(selectedRole === "Vendedor" ? "Vendedores" : "Telemarketing")
    }

    const periodText = selectedPeriod === "1" ? "Hoje" : selectedPeriod === "7" ? "7 dias" : "30 dias"
    parts.push(periodText)

    return parts.join(" > ")
  }

  const resetFilters = () => {
    setSelectedPeriod("7")
    setSelectedTeam("consolidado")
    setSelectedRole("todos")
  }

  const hasActiveFilters = selectedPeriod !== "7" || selectedTeam !== "consolidado" || selectedRole !== "todos"

  const getRecordCount = () => {
    return filteredData.orion.length + filteredData.furia.length
  }

  const getThemeColors = () => {
    if (selectedTeam === "orion") {
      return {
        primary: "#60A5FA",
        secondary: "#3B82F6",
        accent: "#2563EB",
      }
    } else if (selectedTeam === "furia") {
      return {
        primary: "#2563EB",
        secondary: "#1D4ED8",
        accent: "#1E40AF",
      }
    }
    return {
      primary: "#60A5FA",
      secondary: "#2563EB",
      accent: "#1E40AF",
    }
  }

  const themeColors = getThemeColors()

  const prepareTimelineData = () => {
    const dateMap = new Map()

    // Add Meta Ads data
    filteredData.metaAds.forEach((item) => {
      if (!dateMap.has(item.data)) {
        dateMap.set(item.data, { data: item.data, leads: 0, vendas: 0, faturamento: 0, gasto: 0 })
      }
      const entry = dateMap.get(item.data)
      entry.leads += item.leads
      entry.gasto += item.gasto
    })

    // Add sales data
    ;[...filteredData.orion, ...filteredData.furia].forEach((item) => {
      if (!dateMap.has(item.data)) {
        dateMap.set(item.data, { data: item.data, leads: 0, vendas: 0, faturamento: 0, gasto: 0 })
      }
      const entry = dateMap.get(item.data)
      entry.vendas += item.vendas
      entry.faturamento += item.valor_vendas
    })

    return Array.from(dateMap.values()).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
  }

  const prepareCampaignData = () => {
    return filteredData.metaAds.map((item) => ({
      campanha: item.campanha.substring(0, 15) + "...",
      leads: item.leads,
      gasto: item.gasto,
      roas: item.roas,
    }))
  }

  const prepareFunnelData = (teamData: VendasData[], teamName: string) => {
    const totals = calculateTeamKPIs(teamData)
    return [
      {
        name: "Ligações",
        value: totals.totalLigacoes,
        fill: teamName === "Órion" ? themeColors.primary : themeColors.secondary,
      },
      {
        name: "Conexões",
        value: totals.totalConexoes,
        fill: teamName === "Órion" ? themeColors.secondary : themeColors.accent,
      },
      {
        name: "Agendamentos",
        value: totals.totalAgendamentos,
        fill: teamName === "Órion" ? themeColors.accent : "#1E3A8A",
      },
      { name: "Vendas", value: totals.totalVendas, fill: teamName === "Órion" ? "#1D4ED8" : "#1E3A8A" },
    ]
  }

  const prepareDailyRevenueData = () => {
    const dateMap = new Map()

    filteredData.orion.forEach((item) => {
      if (!dateMap.has(item.data)) {
        dateMap.set(item.data, { data: item.data, orion: 0, furia: 0 })
      }
      dateMap.get(item.data).orion += item.valor_vendas
    })

    filteredData.furia.forEach((item) => {
      if (!dateMap.has(item.data)) {
        dateMap.set(item.data, { data: item.data, orion: 0, furia: 0 })
      }
      dateMap.get(item.data).furia += item.valor_vendas
    })

    return Array.from(dateMap.values()).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
  }

  const calculateRoleMetrics = (data: VendasData[]) => {
    const vendedores = data.filter((item) => item.funcao === "Vendedor")
    const telemarketing = data.filter((item) => item.funcao === "Telemarketing")

    return {
      vendedores: {
        count: vendedores.length,
        ligacoes: vendedores.reduce((sum, item) => sum + item.ligacoes, 0),
        conexoes: vendedores.reduce((sum, item) => sum + item.conexoes, 0),
        agendamentos: vendedores.reduce((sum, item) => sum + item.agendamentos, 0),
        vendas: vendedores.reduce((sum, item) => sum + item.vendas, 0),
        faturamento: vendedores.reduce((sum, item) => sum + item.valor_vendas, 0),
      },
      telemarketing: {
        count: telemarketing.length,
        ligacoes: telemarketing.reduce((sum, item) => sum + item.ligacoes, 0),
        conexoes: telemarketing.reduce((sum, item) => sum + item.conexoes, 0),
        agendamentos: telemarketing.reduce((sum, item) => sum + item.agendamentos, 0),
        vendas: telemarketing.reduce((sum, item) => sum + item.vendas, 0),
        faturamento: telemarketing.reduce((sum, item) => sum + item.valor_vendas, 0),
      },
    }
  }

  const timelineData = prepareTimelineData()
  const campaignData = prepareCampaignData()
  const dailyRevenueData = prepareDailyRevenueData()

  const orionRoleMetrics = calculateRoleMetrics(filteredData.orion)
  const furiaRoleMetrics = calculateRoleMetrics(filteredData.furia)

  const getRoleIcon = (role: string) => {
    if (role === "Vendedor") {
      return <Briefcase className="w-4 h-4 text-blue-500" />
    } else if (role === "Telemarketing") {
      return <PhoneCall className="w-4 h-4 text-green-500" />
    }
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src="/images/fbs-logo.png" alt="FBS Prime Logo" className="h-16 w-auto lg:h-20" />
              <div>
                <h1 className="text-3xl font-bold text-white">{getDynamicTitle()} - Central de Performance</h1>
                <p className="text-slate-300 mt-1">Marketing Digital + Equipes Órion & Fúria em tempo real</p>
                <div className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                  <span>{getBreadcrumb()}</span>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      {getRecordCount()} registros
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger
                  className={`w-48 border-slate-600 text-white ${selectedPeriod !== "7" ? "bg-green-600" : "bg-slate-700"}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Hoje</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger
                  className={`w-48 border-slate-600 text-white ${selectedTeam !== "consolidado" ? "bg-green-600" : "bg-slate-700"}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consolidado">Consolidado</SelectItem>
                  <SelectItem value="orion">Órion</SelectItem>
                  <SelectItem value="furia">Fúria</SelectItem>
                  <SelectItem value="comparativo">Comparativo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger
                  className={`w-48 border-slate-600 text-white ${selectedRole !== "todos" ? "bg-green-600" : "bg-slate-700"}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Vendedor">Vendedores</SelectItem>
                  <SelectItem value="Telemarketing">Telemarketing</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={refreshMetaAdsData}
                variant="outline"
                size="sm"
                className="bg-blue-600 border-blue-500 text-white hover:bg-blue-500"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Atualizar Meta Ads
              </Button>

              {hasActiveFilters && (
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="sm"
                  className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm text-slate-300">
            <CalendarDays className="w-4 h-4" />
            <span>Última atualização: {lastUpdate.toLocaleString("pt-BR")}</span>
            {isFiltering && (
              <div className="flex items-center gap-2 ml-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Aplicando filtros...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {selectedRole !== "Telemarketing" && (
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Visão Geral Executiva</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">ROI Geral</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{formatPercentage(kpis.roi_geral)}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {kpis.roi_geral > 0 ? "+" : ""}
                    {kpis.roi_geral.toFixed(1)}% vs período anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Custo por Venda</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{formatCurrency(kpis.custo_por_venda)}</div>
                  <p className="text-xs text-slate-500 mt-1">Investimento / Total de vendas</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Conversão Lead→Venda</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{formatPercentage(kpis.conversao_lead_venda)}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {orionKPIs.totalVendas + furiaKPIs.totalVendas} vendas de{" "}
                    {filteredData.metaAds.reduce((sum, item) => sum + item.leads, 0)} leads
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Faturamento Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{formatCurrency(kpis.faturamento_total)}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedTeam === "orion"
                      ? "Equipe Órion"
                      : selectedTeam === "furia"
                        ? "Equipe Fúria"
                        : "Órion + Fúria combinadas"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {selectedRole === "Telemarketing" && (
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Performance Telemarketing - Thayssa</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Ligações</CardTitle>
                  <PhoneCall className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    {orionRoleMetrics.telemarketing.ligacoes + furiaRoleMetrics.telemarketing.ligacoes}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Conexões</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    {orionRoleMetrics.telemarketing.conexoes + furiaRoleMetrics.telemarketing.conexoes}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Agendamentos</CardTitle>
                  <Target className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    {orionRoleMetrics.telemarketing.agendamentos + furiaRoleMetrics.telemarketing.agendamentos}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {selectedRole !== "Telemarketing" && (
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Performance de Marketing (Meta Ads)</h2>

            {/* Meta Ads Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600">Impressões Total</div>
                  <div className="text-xl font-bold text-slate-800">
                    {filteredData.metaAds.reduce((sum, item) => sum + item.impressoes, 0).toLocaleString("pt-BR")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600">Cliques Total</div>
                  <div className="text-xl font-bold text-slate-800">
                    {filteredData.metaAds.reduce((sum, item) => sum + item.cliques, 0).toLocaleString("pt-BR")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600">CTR Média</div>
                  <div className="text-xl font-bold text-slate-800">
                    {formatPercentage(
                      filteredData.metaAds.reduce((sum, item) => sum + item.ctr, 0) / filteredData.metaAds.length || 0,
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600">CPC Médio</div>
                  <div className="text-xl font-bold text-slate-800">
                    {formatCurrency(
                      filteredData.metaAds.reduce((sum, item) => sum + item.cpc, 0) / filteredData.metaAds.length || 0,
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600">CPL Médio</div>
                  <div className="text-xl font-bold text-slate-800">
                    {formatCurrency(
                      filteredData.metaAds.reduce((sum, item) => sum + item.cpl, 0) / filteredData.metaAds.length || 0,
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600">ROAS Médio</div>
                  <div className="text-xl font-bold text-slate-800">
                    {(
                      filteredData.metaAds.reduce((sum, item) => sum + item.roas, 0) / filteredData.metaAds.length || 0
                    ).toFixed(1)}
                    x
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Evolução Diária: Gasto vs ROAS</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredData.metaAds}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "gasto" ? formatCurrency(Number(value)) : `${value}x`,
                          name,
                        ]}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="gasto" fill={themeColors.primary} name="Gasto" />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="roas"
                        stroke="#10B981"
                        strokeWidth={3}
                        name="ROAS"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Performance por Campanha</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={campaignData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="campanha" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value, name) => [name === "gasto" ? formatCurrency(Number(value)) : value, name]}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="leads" fill={themeColors.secondary} name="Leads" />
                      <Bar yAxisId="right" dataKey="gasto" fill={themeColors.primary} name="Gasto" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            {selectedRole === "Telemarketing" ? "Detalhamento Telemarketing" : "Performance Comercial (Por Equipes)"}
          </h2>

          {/* Conditional metrics based on role */}
          {selectedRole !== "Telemarketing" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Vendedores</CardTitle>
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    {orionRoleMetrics.vendedores.count + furiaRoleMetrics.vendedores.count}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Faturamento:{" "}
                    {formatCurrency(orionRoleMetrics.vendedores.faturamento + furiaRoleMetrics.vendedores.faturamento)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Telemarketing</CardTitle>
                  <PhoneCall className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    {orionRoleMetrics.telemarketing.count + furiaRoleMetrics.telemarketing.count}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Agendamentos:{" "}
                    {orionRoleMetrics.telemarketing.agendamentos + furiaRoleMetrics.telemarketing.agendamentos}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Taxa Conexão Geral</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{formatPercentage(kpis.taxa_conexao)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{formatCurrency(kpis.ticket_medio)}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTeam === "consolidado" || selectedTeam === "comparativo" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`border-l-4 ${selectedTeam === "orion" ? "border-l-blue-400" : "border-l-blue-400"}`}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Equipe Órion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600">Vendas</div>
                      <div className="text-2xl font-bold text-slate-800">{orionKPIs.totalVendas}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Faturamento</div>
                      <div className="text-2xl font-bold text-slate-800">
                        {formatCurrency(orionKPIs.totalFaturamento)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3" />
                      <span>Vendedores: {orionRoleMetrics.vendedores.count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3 h-3" />
                      <span>Telemarketing: {orionRoleMetrics.telemarketing.count}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    Taxa de conversão:{" "}
                    <span className="font-semibold text-slate-800">{formatPercentage(orionKPIs.taxaConversao)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Equipe Fúria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600">Vendas</div>
                      <div className="text-2xl font-bold text-slate-800">{furiaKPIs.totalVendas}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Faturamento</div>
                      <div className="text-2xl font-bold text-slate-800">
                        {formatCurrency(furiaKPIs.totalFaturamento)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3" />
                      <span>Vendedores: {furiaRoleMetrics.vendedores.count}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <PhoneCall className="w-3 h-3" />
                      <span>Telemarketing: {furiaRoleMetrics.telemarketing.count}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    Taxa de conversão:{" "}
                    <span className="font-semibold text-slate-800">{formatPercentage(furiaKPIs.taxaConversao)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : selectedTeam === "orion" ? (
            <Card className="border-l-4 border-l-blue-400">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Equipe Órion - Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-slate-600">Vendas</div>
                    <div className="text-2xl font-bold text-slate-800">{orionKPIs.totalVendas}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Faturamento</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {formatCurrency(orionKPIs.totalFaturamento)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Ligações</div>
                    <div className="text-2xl font-bold text-slate-800">{orionKPIs.totalLigacoes}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Taxa Conversão</div>
                    <div className="text-2xl font-bold text-slate-800">{formatPercentage(orionKPIs.taxaConversao)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedTeam === "furia" ? (
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Equipe Fúria - Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-slate-600">Vendas</div>
                    <div className="text-2xl font-bold text-slate-800">{furiaKPIs.totalVendas}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Faturamento</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {formatCurrency(furiaKPIs.totalFaturamento)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Ligações</div>
                    <div className="text-2xl font-bold text-slate-800">{furiaKPIs.totalLigacoes}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Taxa Conversão</div>
                    <div className="text-2xl font-bold text-slate-800">{formatPercentage(furiaKPIs.taxaConversao)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {selectedRole !== "Telemarketing" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Funil de Conversão Comparativo</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTeam === "orion" ? (
                    <div>
                      <h4 className="text-sm font-medium text-slate-600 mb-2 text-center">Equipe Órion</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <FunnelChart>
                          <Tooltip formatter={(value) => [value, ""]} />
                          <Funnel dataKey="value" data={prepareFunnelData(filteredData.orion, "Órion")} />
                        </FunnelChart>
                      </ResponsiveContainer>
                    </div>
                  ) : selectedTeam === "furia" ? (
                    <div>
                      <h4 className="text-sm font-medium text-slate-600 mb-2 text-center">Equipe Fúria</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <FunnelChart>
                          <Tooltip formatter={(value) => [value, ""]} />
                          <Funnel dataKey="value" data={prepareFunnelData(filteredData.furia, "Fúria")} />
                        </FunnelChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-2 text-center">Equipe Órion</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <FunnelChart>
                            <Tooltip formatter={(value) => [value, ""]} />
                            <Funnel dataKey="value" data={prepareFunnelData(filteredData.orion, "Órion")} />
                          </FunnelChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-2 text-center">Equipe Fúria</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <FunnelChart>
                            <Tooltip formatter={(value) => [value, ""]} />
                            <Funnel dataKey="value" data={prepareFunnelData(filteredData.furia, "Fúria")} />
                          </FunnelChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Faturamento Diário por Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                      <Legend />
                      {selectedTeam !== "furia" && <Bar dataKey="orion" fill={themeColors.primary} name="Órion" />}
                      {selectedTeam !== "orion" && <Bar dataKey="furia" fill={themeColors.secondary} name="Fúria" />}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {selectedRole !== "Telemarketing" && (
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Análise Integrada</h2>

            {/* Combined Timeline Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  📊 Timeline Integrado: Leads → Vendas → Faturamento
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Correlação entre investimento em marketing, geração de leads e resultados comerciais
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="data"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                      }
                    />
                    <YAxis
                      yAxisId="left"
                      label={{ value: "Leads", angle: -90, position: "insideLeft" }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{ value: "Vendas / Faturamento", angle: 90, position: "insideRight" }}
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatCompactCurrency}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "Leads Gerados") return [value, "📊 Leads"]
                        if (name === "Vendas Fechadas") return [value, "💚 Vendas"]
                        if (name === "Faturamento") return [formatCurrency(Number(value)), "💰 Faturamento"]
                        return [value, name]
                      }}
                      labelFormatter={(label) => `Data: ${new Date(label).toLocaleDateString("pt-BR")}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      formatter={(value) => {
                        if (value === "leads") return "📊 Leads Gerados"
                        if (value === "vendas") return "💚 Vendas Fechadas"
                        if (value === "faturamento") return "💰 Faturamento"
                        return value
                      }}
                    />

                    <Bar yAxisId="left" dataKey="leads" fill={themeColors.primary} opacity={0.6} name="Leads Gerados" />

                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="vendas"
                      stroke="#10B981"
                      strokeWidth={3}
                      name="Vendas Fechadas"
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="faturamento"
                      stroke="#1E3A5F"
                      strokeWidth={3}
                      name="Faturamento"
                      dot={{ fill: "#1E3A5F", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#1E3A5F", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Últimas Campanhas Meta Ads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campanha</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Impressões</TableHead>
                          <TableHead>Cliques</TableHead>
                          <TableHead>CTR</TableHead>
                          <TableHead>Gasto</TableHead>
                          <TableHead>Leads</TableHead>
                          <TableHead>CPL</TableHead>
                          <TableHead>ROAS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.metaAds.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.campanha}</TableCell>
                            <TableCell>{new Date(item.data).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>{item.impressoes.toLocaleString("pt-BR")}</TableCell>
                            <TableCell>{item.cliques}</TableCell>
                            <TableCell>{formatPercentage(item.ctr)}</TableCell>
                            <TableCell>{formatCurrency(item.gasto)}</TableCell>
                            <TableCell>{item.leads}</TableCell>
                            <TableCell>{formatCurrency(item.cpl)}</TableCell>
                            <TableCell>
                              <span
                                className={`font-semibold ${
                                  item.roas >= 4
                                    ? "text-green-600"
                                    : item.roas >= 2
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                {item.roas.toFixed(1)}x
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Performance por Vendedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(selectedTeam === "consolidado" || selectedTeam === "comparativo" || selectedTeam === "orion") &&
                      filteredData.orion.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-blue-600 mb-2 flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            Equipe Órion
                          </h4>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Vendedor</TableHead>
                                  <TableHead>Função</TableHead>
                                  <TableHead>Data</TableHead>
                                  <TableHead>Ligações</TableHead>
                                  <TableHead>Conexões</TableHead>
                                  <TableHead>Vendas</TableHead>
                                  <TableHead>Faturamento</TableHead>
                                  <TableHead>Taxa Conv.</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredData.orion.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{item.vendedor}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {getRoleIcon(item.funcao)}
                                        <span className="text-sm">{item.funcao}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>{new Date(item.data).toLocaleDateString("pt-BR")}</TableCell>
                                    <TableCell>{item.ligacoes}</TableCell>
                                    <TableCell>{item.conexoes}</TableCell>
                                    <TableCell>
                                      <span className={item.funcao === "Telemarketing" ? "text-slate-400" : ""}>
                                        {item.vendas}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className={item.funcao === "Telemarketing" ? "text-slate-400" : ""}>
                                        {formatCurrency(item.valor_vendas)}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      {item.funcao === "Telemarketing" ? (
                                        <span className="text-slate-400 text-sm">N/A</span>
                                      ) : (
                                        <span
                                          className={`font-semibold ${
                                            (item.vendas / item.agendamentos) * 100 >= 40
                                              ? "text-green-600"
                                              : (item.vendas / item.agendamentos) * 100 >= 25
                                                ? "text-yellow-600"
                                                : "text-red-600"
                                          }`}
                                        >
                                          {formatPercentage((item.vendas / item.agendamentos) * 100)}
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                    {/* Fúria Team */}
                    {(selectedTeam === "consolidado" || selectedTeam === "comparativo" || selectedTeam === "furia") &&
                      filteredData.furia.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            Equipe Fúria
                          </h4>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Vendedor</TableHead>
                                  <TableHead>Função</TableHead>
                                  <TableHead>Data</TableHead>
                                  <TableHead>Ligações</TableHead>
                                  <TableHead>Conexões</TableHead>
                                  <TableHead>Vendas</TableHead>
                                  <TableHead>Faturamento</TableHead>
                                  <TableHead>Taxa Conv.</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredData.furia.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{item.vendedor}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {getRoleIcon(item.funcao)}
                                        <span className="text-sm">{item.funcao}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>{new Date(item.data).toLocaleDateString("pt-BR")}</TableCell>
                                    <TableCell>{item.ligacoes}</TableCell>
                                    <TableCell>{item.conexoes}</TableCell>
                                    <TableCell>{item.vendas}</TableCell>
                                    <TableCell>{formatCurrency(item.valor_vendas)}</TableCell>
                                    <TableCell>
                                      <span
                                        className={`font-semibold ${
                                          (item.vendas / item.agendamentos) * 100 >= 40
                                            ? "text-green-600"
                                            : (item.vendas / item.agendamentos) * 100 >= 25
                                              ? "text-yellow-600"
                                              : "text-red-600"
                                        }`}
                                      >
                                        {formatPercentage((item.vendas / item.agendamentos) * 100)}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
