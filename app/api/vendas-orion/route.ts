import { type NextRequest, NextResponse } from "next/server"

const orionData: any[] = [
  {
    data: "2024-01-15",
    equipe: "Órion",
    vendedor: "Giovanna",
    funcao: "Vendedor",
    ligacoes: 25,
    conexoes: 18,
    agendamentos: 8,
    vendas: 3,
    valor_vendas: 45000,
  },
  {
    data: "2024-01-15",
    equipe: "Órion",
    vendedor: "Amanda",
    funcao: "Vendedor",
    ligacoes: 22,
    conexoes: 16,
    agendamentos: 7,
    vendas: 2,
    valor_vendas: 30000,
  },
  {
    data: "2024-01-15",
    equipe: "Órion",
    vendedor: "Nayara",
    funcao: "Vendedor",
    ligacoes: 28,
    conexoes: 20,
    agendamentos: 9,
    vendas: 4,
    valor_vendas: 60000,
  },
  {
    data: "2024-01-15",
    equipe: "Órion",
    vendedor: "Thayssa",
    funcao: "Telemarketing",
    ligacoes: 35,
    conexoes: 25,
    agendamentos: 15,
    vendas: 0,
    valor_vendas: 0,
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const requiredFields = [
      "data",
      "equipe",
      "vendedor",
      "funcao",
      "ligacoes",
      "conexoes",
      "agendamentos",
      "vendas",
      "valor_vendas",
    ]
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ error: `Campo obrigatório ausente: ${field}` }, { status: 400 })
      }
    }

    // Ensure equipe is "Órion"
    body.equipe = "Órion"

    if (!["Vendedor", "Telemarketing"].includes(body.funcao)) {
      return NextResponse.json({ error: "Função deve ser 'Vendedor' ou 'Telemarketing'" }, { status: 400 })
    }

    // Add to storage
    orionData.push(body)

    return NextResponse.json({ message: "Dados da Equipe Órion recebidos com sucesso", data: body }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar dados da Equipe Órion" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(orionData)
}
