import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Usar as credenciais diretamente (temporário para teste)
    const accessToken = "EAARCRhnYrScBPfezYQzWMjaqEEURjVt1e2ZBfZBBzGMPrp82WZAqZAY1sbLd1uZAjT52n5mPtTD4ac7iCJdmzot79GMya20HWr0daz4UakSY7U7zMvswZAbYJArhyQfrLGtEdQ7eav5JYf5E6NhAVCIUd7v0oXO5Cai8w5ywBDrPl7u5DJ5SdymtaWSrUetwZDZD"
    const adAccountId = "act_1008523737497985"
    
    // Testar conexão direta
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?access_token=${accessToken}&limit=5`
    )

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json({
        error: "Erro na API do Meta",
        status: response.status,
        details: errorData,
        url: `https://graph.facebook.com/v18.0/${adAccountId}/campaigns`
      }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Conexão direta com Meta Ads API funcionando!",
      adAccountId,
      campanhasEncontradas: data.data?.length || 0,
      primeiraCampanha: data.data?.[0] || null
    })

  } catch (error) {
    return NextResponse.json({
      error: "Erro ao testar conexão direta",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}
