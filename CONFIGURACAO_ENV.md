# CONFIGURAÇÃO DO .env.local

Crie o arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Meta Ads API Configuration
META_APP_ID=1234443241785746
META_APP_SECRET=5b4fb267bc7d3f6fd8cc40bb1d79a25a
META_ACCESS_TOKEN=EAARCRhnYrScBPfezYQzWMjaqEEURjVt1e2ZBfZBBzGMPrp82WZAqZAY1sbLd1uZAjT52n5mPtTD4ac7iCJdmzot79GMya20HWr0daz4UakSY7U7zMvswZAbYJArhyQfrLGtEdQ7eav5JYf5E6NhAVCIUd7v0oXO5Cai8w5ywBDrPl7u5DJ5SdymtaWSrUetwZDZD
META_AD_ACCOUNT_ID=act_1008523737497985

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## INSTRUÇÕES:

1. **Crie o arquivo** `.env.local` na raiz do projeto (mesmo nível do package.json)
2. **Cole o conteúdo** acima no arquivo
3. **Salve o arquivo**
4. **Reinicie o servidor** com `npm run dev`

## TESTES:

1. **Teste a conexão**: http://localhost:3000/api/test-connection
2. **Teste os dados**: http://localhost:3000/api/meta-ads
3. **Veja o dashboard**: http://localhost:3000

## FUNCIONALIDADES ADICIONADAS:

✅ **Integração com Meta Ads API real**
✅ **Cache de 5 minutos** para otimizar performance
✅ **Botão de refresh** no dashboard
✅ **Fallback para dados mockados** se a API falhar
✅ **Endpoint de teste** para verificar conexão
✅ **Processamento de dados** em tempo real

## PRÓXIMOS PASSOS:

1. Configure o .env.local
2. Teste a conexão
3. Veja seus dados reais do Meta Ads no dashboard!
