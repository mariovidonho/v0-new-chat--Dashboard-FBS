import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    META_APP_ID: process.env.META_APP_ID ? "✅ Configurado" : "❌ Não configurado",
    META_APP_SECRET: process.env.META_APP_SECRET ? "✅ Configurado" : "❌ Não configurado", 
    META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN ? "✅ Configurado" : "❌ Não configurado",
    META_AD_ACCOUNT_ID: process.env.META_AD_ACCOUNT_ID ? "✅ Configurado" : "❌ Não configurado",
    NODE_ENV: process.env.NODE_ENV,
    todasVariaveis: Object.keys(process.env).filter(key => key.startsWith('META_'))
  })
}
