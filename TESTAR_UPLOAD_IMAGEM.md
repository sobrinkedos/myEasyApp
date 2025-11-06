# 🖼️ Testando Upload de Imagem no Estoque

## ✅ Pré-requisitos

1. Backend e Frontend rodando
2. Migration aplicada (campo `imageUrl` no banco)
3. Usuário logado no sistema

## 📋 Passo a Passo

### 1. Iniciar os Servidores

Execute:
```
START_SERVERS.bat
```

Aguarde até ver:
- Backend: `Server running on port 3000`
- Frontend: `Local: http://localhost:5173/`

### 2. Acessar o Sistema

1. Abra o navegador em: http://localhost:5173
2. Faça login com suas credenciais
3. Navegue até: **Estoque** (menu lateral)

### 3. Criar Novo Item com Imagem

1. Clique em **"+ Novo Item"**
2. Preencha os campos obrigatórios:
   - Nome do Produto
   - Categoria
   - Unidade
   - Quantidade Atual
   - Quantidade Mínima
   - Preço de Custo
   - Preço de Venda

3. **Upload da Imagem:**
   - Clique em "Escolher arquivo"
   - Selecione uma imagem (JPG, PNG - máx 5MB)
   - Veja o preview da imagem

4. Clique em **"Cadastrar"**

### 4. Verificar o Item

1. Na listagem, encontre o item criado
2. Clique no item para ver os detalhes
3. A imagem deve aparecer no topo da página

### 5. Editar Imagem

1. Na página de detalhes, clique em **"Editar"**
2. Escolha uma nova imagem
3. Clique em **"Atualizar"**
4. Verifique se a imagem foi atualizada

## 🔍 Verificações

### Backend
- As imagens são salvas em: `uploads/`
- URL retornada: `/uploads/[uuid].jpg`

### Frontend
- Preview funciona antes de salvar
- Imagem aparece na página de detalhes
- Imagem pode ser atualizada

### Banco de Dados
- Campo `imageUrl` é preenchido
- Formato: `/uploads/[uuid].[ext]`

## ❌ Problemas Comuns

### "Network Error" ou "ERR_CONNECTION_REFUSED"
- **Causa**: Backend não está rodando
- **Solução**: Execute `START_SERVERS.bat`

### "Tipo de arquivo inválido"
- **Causa**: Arquivo não é JPG ou PNG
- **Solução**: Use apenas imagens JPG ou PNG

### "File too large"
- **Causa**: Arquivo maior que 5MB
- **Solução**: Reduza o tamanho da imagem

### Imagem não aparece
- **Causa**: Caminho incorreto ou arquivo não foi salvo
- **Solução**: 
  1. Verifique se a pasta `uploads/` existe
  2. Verifique se o arquivo está lá
  3. Verifique o console do navegador

## 📸 Exemplo de Teste

```
Nome: Cerveja Heineken 350ml
Categoria: Bebidas Alcoólicas
Unidade: Unidade
Quantidade Atual: 100
Quantidade Mínima: 20
Preço de Custo: 3.50
Preço de Venda: 8.00
Imagem: [Foto da cerveja]
```

## ✨ Funcionalidades Implementadas

- ✅ Upload de imagem no cadastro
- ✅ Preview antes de salvar
- ✅ Validação de tipo (JPG, PNG)
- ✅ Validação de tamanho (5MB)
- ✅ Exibição na página de detalhes
- ✅ Edição de imagem
- ✅ Armazenamento seguro no servidor

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar crop/resize de imagem
- [ ] Múltiplas imagens por produto
- [ ] Galeria de imagens
- [ ] Compressão automática
- [ ] Upload via drag & drop
