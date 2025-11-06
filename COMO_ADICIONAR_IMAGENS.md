# 🖼️ Como Adicionar Imagens aos Produtos

## Método 1: Pelo Frontend (Recomendado)

### Criar Novo Produto com Imagem

1. Acesse: http://localhost:5173/products
2. Clique em **"Novo Produto"**
3. Preencha os campos:
   - Nome
   - Descrição
   - Categoria
   - Preço
4. No campo **"URL da Imagem"**, cole uma URL de imagem
5. Clique em **"Salvar Produto"**

### Editar Produto Existente

1. Na listagem de produtos, clique no botão **"Editar"** (ícone de lápis)
2. No campo **"URL da Imagem"**, cole uma URL de imagem
3. Clique em **"Salvar Produto"**

## URLs de Imagens de Exemplo

Você pode usar estas URLs gratuitas do Unsplash:

### Pizzas
```
https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400
https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400
https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400
```

### Hambúrgueres
```
https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400
https://images.unsplash.com/photo-1550547660-d9450f859349?w=400
https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400
```

### Batatas Fritas
```
https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400
https://images.unsplash.com/photo-1630384082525-1e9e6f4d8c0f?w=400
```

### Bebidas
```
https://images.unsplash.com/photo-1546173159-315724a31696?w=400
https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400
https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400
```

### Sobremesas
```
https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400
https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400
https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400
```

## Método 2: Upload de Arquivo (Futuro)

Em uma versão futura, será possível fazer upload direto de arquivos. Por enquanto, use URLs externas.

## Onde as Imagens Aparecem

As imagens serão exibidas em:

1. **Listagem de Produtos** - Card com imagem no topo
2. **Detalhes do Produto** - Imagem grande na página de detalhes
3. **Formulário de Edição** - Preview da imagem (se implementado)

## Dicas

- Use imagens com proporção 16:9 ou 4:3 para melhor visualização
- Recomendado: largura mínima de 400px
- Formatos suportados: JPG, PNG, WebP
- URLs devem começar com `http://` ou `https://`

## Troubleshooting

### Imagem não aparece?

1. Verifique se a URL está correta
2. Teste a URL no navegador (cole na barra de endereços)
3. Certifique-se que a URL começa com `https://`
4. Alguns sites bloqueiam hotlinking - use Unsplash ou Imgur

### Imagem aparece cortada?

As imagens são automaticamente ajustadas para:
- **Listagem**: 192px de altura (h-48)
- **Detalhes**: 256px de altura (h-64)
- Largura: 100% do container

O CSS `object-cover` garante que a imagem preencha o espaço sem distorcer.

---

**Nota**: O sistema está preparado para upload de arquivos, mas por enquanto use URLs externas.
