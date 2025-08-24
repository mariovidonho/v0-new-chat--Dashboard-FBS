import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
const metaAdsData: any[] = [
  {
    data: "2024-01-15",
    plataforma: "Meta Ads",
    campanha: "Lançamento Q1",
    id_campanha: "23847521234567890",
    impressoes: 15420,
    cliques: 450,
    alcance: 12800,
    frequencia: 1.2,
    cpc: 2.85,
    ctr: 2.92,
    cpm: 8.75,
    gasto: 1282.5,
    conversoes: 28,
    leads: 35,
    cpl: 36.64,
    roas: 4.2,
  },
  {
    data: "2024-01-16",
    plataforma: "Meta Ads",
    campanha: "Retargeting",
    id_campanha: "23847521234567891",
    impressoes: 8930,
    cliques: 320,
    alcance: 7500,
    frequencia: 1.19,
    cpc: 2.2,
    ctr: 3.58,
    cpm: 7.88,
    gasto: 704.0,
    conversoes: 32,
    leads: 28,
    cpl: 25.14,
    roas: 5.1,
  },
  {
    data: "2024-01-17",
    plataforma: "Meta Ads",
    campanha: "Lookalike",
    id_campanha: "23847521234567892",
    impressoes: 12100,
    cliques: 380,
    alcance: 9800,
    frequencia: 1.23,
    cpc: 2.95,
    ctr: 3.14,
    cpm: 9.26,
    gasto: 1121.0,
    conversoes: 25,
    leads: 32,
    cpl: 35.03,
    roas: 3.8,
  },
]

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
    metaAdsData.push(body)

    return NextResponse.json({ message: "Dados do Meta Ads recebidos com sucesso", data: body }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar dados do Meta Ads" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(metaAdsData)
}
