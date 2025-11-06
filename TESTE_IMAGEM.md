# 🧪 Teste de Imagem - Passo a Passo

## ✅ Correções Aplicadas

1. ✅ Rota `:id` adicionada no router
2. ✅ Campo `imageUrl` adicionado no schema de validação
3. ✅ Campo de imagem adicionado na seção de detalhes
4. ✅ Backend retornando `imageUrl` nas queries

## 🎯 Como Testar

### 1. Criar um Novo Item COM Imagem

1. Acesse: http://localhost:5174/stock
2. Clique em **"+ Novo Item"**
3. Preencha os campos:
   ```
   Nome: Cerveja Heineken 350ml
   Categoria: Bebidas Alcoólicas
   Unidade: Unidade
   Quantidade Atual: 100
   Quantidade Mínima: 20
   Preço de Custo: 3.50
   Preço de Venda: 8.00
   ```
4. **IMPORTANTE**: Clique em "Escolher arquivo" e selecione uma imagem
5. Veja o preview aparecer
6. Clique em **"Cadastrar"**

### 2. Verificar na Listagem

1. O item deve aparecer na lista
2. Clique no item para abrir os detalhes

### 3. Verificar na Página de Detalhes

Você deve ver:
- ✅ Imagem grande no topo (ao lado do nome)
- ✅ Imagem também na seção "Detalhes" (se houver)
- ✅ Todas as informações do produto
- ✅ Histórico de movimentações

### 4. Editar a Imagem

1. Na página de detalhes, clique em **"Editar"**
2. Escolha uma nova imagem
3. Clique em **"Atualizar"**
4. Volte aos detalhes e veja a nova imagem

## 🔍 Verificar no Console do Navegador

Abra o DevTools (F12) e vá na aba "Network":

1. Ao criar o item, você deve ver:
   - POST `/api/v1/upload/image` → Status 200
   - POST `/api/v1/stock-management/items` → Status 201

2. Ao ver os detalhes:
   - GET `/api/v1/stock-management/items/:id` → Status 200
   - A resposta deve conter `"imageUrl": "/uploads/..."`

## 🐛 Se a Imagem NÃO Aparecer

### Verifique:

1. **Console do navegador** (F12) - Tem algum erro?
2. **Network tab** - A imagem está sendo carregada?
3. **Resposta da API** - Tem o campo `imageUrl`?

### Teste Manual da API:

```bash
# Ver detalhes de um item
curl http://localhost:3000/api/v1/stock-management/items/:id \
  -H "Authorization: Bearer SEU_TOKEN"
```

A resposta deve incluir:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "imageUrl": "/uploads/abc123.jpg",
    ...
  }
}
```

## 📸 Onde as Imagens São Salvas

- **Pasta**: `uploads/` (na raiz do projeto backend)
- **URL**: `http://localhost:3000/uploads/[filename]`
- **Formato**: UUID + extensão (ex: `abc-123-def.jpg`)

## ✅ Checklist Final

- [ ] Criar item com imagem
- [ ] Ver preview antes de salvar
- [ ] Item salvo com sucesso
- [ ] Imagem aparece no topo da página de detalhes
- [ ] Imagem aparece na seção de detalhes
- [ ] Editar e trocar a imagem
- [ ] Nova imagem aparece corretamente

## 🎉 Tudo Funcionando?

Se todos os itens acima estiverem OK, o sistema está 100% funcional!
