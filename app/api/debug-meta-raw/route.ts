import { NextResponse } from "next/server"
import MetaAdsService from "@/lib/meta-ads-service"

export async function GET() {
  try {
    // Testar cada método separadamente
    const campaigns = await MetaAdsService.getCampaigns()
    const realTimeData = await MetaAdsService.getRealTimeData()
    
    return NextResponse.json({
      success: true,
      campaigns: campaigns,
      realTimeData: realTimeData,
      campaignsCount: campaigns.length,
      realTimeDataCount: realTimeData.length
    })
  } catch (error) {
    return NextResponse.json({
      error: "Erro ao buscar dados",
      details: error instanceof Error ? error.message : "Erro desconhecido",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
