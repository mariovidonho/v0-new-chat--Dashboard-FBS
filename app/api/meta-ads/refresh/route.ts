import { NextResponse } from "next/server"
import MetaAdsService from "@/lib/meta-ads-service"

export async function POST() {
  try {
    const realTimeData = await MetaAdsService.getRealTimeData()
    
    return NextResponse.json({
      message: "Dados atualizados com sucesso",
      data: realTimeData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao atualizar dados:', error)
    return NextResponse.json(
      { error: "Erro ao atualizar dados do Meta Ads" },
      { status: 500 }
    )
  }
}
