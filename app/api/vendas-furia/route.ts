import { type NextRequest, NextResponse } from "next/server"

const furiaData: any[] = [
  {
    data: "2024-01-15",
    equipe: "Fúria",
    vendedor: "Cley",
    funcao: "Vendedor",
    ligacoes: 30,
    conexoes: 22,
    agendamentos: 12,
    vendas: 5,
    valor_vendas: 75000,
  },
  {
    data: "2024-01-15",
    equipe: "Fúria",
    vendedor: "Erick",
    funcao: "Vendedor",
    ligacoes: 26,
    conexoes: 19,
    agendamentos: 10,
    vendas: 3,
    valor_vendas: 45000,
  },
  {
    data: "2024-01-15",
    equipe: "Fúria",
    vendedor: "Camila",
    funcao: "Vendedor",
    ligacoes: 24,
    conexoes: 18,
    agendamentos: 8,
    vendas: 4,
    valor_vendas: 50000,
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

    // Ensure equipe is "Fúria"
    body.equipe = "Fúria"

    if (!["Vendedor", "Telemarketing"].includes(body.funcao)) {
      return NextResponse.json({ error: "Função deve ser 'Vendedor' ou 'Telemarketing'" }, { status: 400 })
    }

    // Add to storage
    furiaData.push(body)

    return NextResponse.json({ message: "Dados da Equipe Fúria recebidos com sucesso", data: body }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar dados da Equipe Fúria" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(furiaData)
}
