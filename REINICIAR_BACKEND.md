# 🔄 Como Reiniciar o Backend

## Problema Resolvido
✅ Adicionados todos os campos faltantes no backend de ingredientes:
- description, barcode, sku
- maximumQuantity
- supplier, location, expirationDate
- **imageUrl** (campo principal para as imagens)

## Para Aplicar as Mudanças

### Opção 1: Reiniciar Manualmente

1. **Parar o backend** (Ctrl+C no terminal onde está rodando)

2. **Iniciar novamente:**
```bash
npm run dev
```

### Opção 2: Usar o Script de Inicialização

Execute o arquivo:
```
START_SERVERS.bat
```

## Testando as Imagens

Após reiniciar o backend:

1. **Criar um novo insumo com imagem:**
   - Acesse: http://localhost:5173/ingredients/new
   - Preencha os campos
   - Faça upload de uma imagem
   - Salve

2. **Verificar na listagem:**
   - A imagem deve aparecer na coluna "Imagem"

3. **Verificar nos detalhes:**
   - Clique no ícone de olho
   - A imagem deve aparecer em tamanho grande

## Troubleshooting

### Se a imagem ainda não aparecer:

1. **Verifique o console do navegador (F12):**
   - Procure por erros de carregamento de imagem
   - Verifique a URL da imagem

2. **Verifique a resposta da API:**
   - Abra a aba Network (F12)
   - Faça uma requisição para `/api/v1/ingredients`
   - Verifique se o campo `imageUrl` está presente na resposta

3. **Verifique se o upload funcionou:**
   - Ao salvar um insumo com imagem, verifique se não há erros
   - O campo `imageUrl` deve ser salvo no banco de dados

## Estrutura de URLs

- **API Base:** `http://localhost:3000`
- **Uploads:** `http://localhost:3000/uploads/...`
- **Frontend:** `http://localhost:5173`

A função `getImageUrl()` automaticamente adiciona o prefixo correto.
