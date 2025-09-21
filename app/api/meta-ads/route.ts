import { type NextRequest, NextResponse } from "next/server"
import MetaAdsService from "@/lib/meta-ads-service"

// Cache para evitar muitas chamadas à API
let cachedData: any[] = []
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["data", "plataforma", "campanha", "impressoes", "cliques", "gasto", "leads"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Campo obrigatório ausente: ${field}` }, { status: 400 })
      }
    }

    // Add to storage
    cachedData.push(body)

    return NextResponse.json({ message: "Dados do Meta Ads recebidos com sucesso", data: body }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar dados do Meta Ads" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const now = Date.now()
    
    // Verificar se precisa atualizar o cache
    if (now - lastFetch > CACHE_DURATION || cachedData.length === 0) {
      try {
        // Buscar dados reais do Meta Ads
        const realTimeData = await MetaAdsService.getRealTimeData()
        cachedData = realTimeData
        lastFetch = now
        
        return NextResponse.json(realTimeData)
      } catch (apiError) {
        console.error('Erro ao buscar dados do Meta Ads:', apiError)
        
        // Tentar buscar apenas as campanhas se insights falhar
        try {
          const campaigns = await MetaAdsService.getCampaigns()
          const fallbackData = campaigns.map(campaign => ({
            data: new Date().toISOString().split('T')[0],
            plataforma: "Meta Ads",
            campanha: campaign.name,
            id_campanha: campaign.id,
            impressoes: 0,
            cliques: 0,
            alcance: 0,
            frequencia: 0,
            cpc: 0,
            ctr: 0,
            cpm: 0,
            gasto: 0,
            conversoes: 0,
            leads: 0,
            cpl: 0,
            roas: 0,
          }))
          
          cachedData = fallbackData
          lastFetch = now
          return NextResponse.json(fallbackData)
        } catch (campaignError) {
          console.error('Erro ao buscar campanhas:', campaignError)
          
          // Fallback final
          const fallbackData = [
            {
              data: new Date().toISOString().split('T')[0],
              plataforma: "Meta Ads",
              campanha: "Erro na API - Dados Mockados",
              id_campanha: "error",
              impressoes: 0,
              cliques: 0,
              alcance: 0,
              frequencia: 0,
              cpc: 0,
              ctr: 0,
              cpm: 0,
              gasto: 0,
              conversoes: 0,
              leads: 0,
              cpl: 0,
              roas: 0,
            }
          ]
          
          return NextResponse.json(fallbackData)
        }
      }
    }
    
    // Retornar dados do cache
    return NextResponse.json(cachedData)
  } catch (error) {
    console.error('Erro na API Meta Ads:', error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
