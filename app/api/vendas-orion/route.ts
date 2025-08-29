import { NextResponse } from 'next/server';

// Este array simula o banco de dados temporário.
// A solução definitiva para a persistência seria usar um banco de dados real.
let vendasOrionData = [];

// Handler para a requisição GET
export async function GET() {
  return NextResponse.json(vendasOrionData);
}

// Handler para a requisição POST
export async function POST(req: Request) {
  const newData = await req.json();

  if (!Array.isArray(newData)) {
    return NextResponse.json({ error: 'Os dados enviados devem ser um array de objetos.' }, { status: 400 });
  }

  newData.forEach(item => {
    const { data, vendedor, equipe } = item;
    
    // Verifica se o registro já existe para o mesmo vendedor, equipe e data
    const existingRecordIndex = vendasOrionData.findIndex(
      (record) => record.data === data && record.vendedor === vendedor && record.equipe === equipe
    );

    if (existingRecordIndex !== -1) {
      // Se existir, atualiza o registro
      vendasOrionData[existingRecordIndex] = { ...vendasOrionData[existingRecordIndex], ...item };
    } else {
      // Se não existir, adiciona o novo registro
      vendasOrionData.push(item);
    }
  });

  return NextResponse.json({ message: 'Dados da Equipe Orion recebidos com sucesso e atualizados.' });
}
