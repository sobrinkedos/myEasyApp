# 🔍 Debug - Imagens Não Aparecem

## 📋 Checklist de Verificação

### 1. Abra o Console do Navegador (F12)

Recarregue a página e veja os logs:
- `📦 Item carregado:` - Deve mostrar os dados do item
- `🖼️ ImageURL:` - Deve mostrar algo como `/uploads/abc.png`
- `🌐 URL completa:` - Deve mostrar `http://localhost:3000/uploads/abc.png`

### 2. Aba Network (F12)

Filtre por "uploads" e veja:
- Há requisições para `/uploads/...`?
- Qual o status? (200, 404, 403, CORS error?)
- Qual a URL completa?

### 3. Teste Direto no Navegador

Abra uma nova aba e cole:
```
http://localhost:3000/uploads/c5350373-7274-4189-b765-dce6bb65b25f.png
```

A imagem aparece? 
- ✅ SIM → O backend está OK, problema é no frontend
- ❌ NÃO → Problema no backend

### 4. Verifique o Elemento HTML

No console, execute:
```javascript
document.querySelector('img[alt="Cerveja Brahma lata 350ml"]')
```

Veja o atributo `src`. Está correto?

### 5. Possíveis Problemas

#### A) imageUrl é null/undefined
```
Solução: O item não tem imagem cadastrada
Ação: Edite o item e faça upload de uma imagem
```

#### B) CORS Error
```
Erro no console: "blocked by CORS policy"
Solução: Verificar configuração de CORS no backend
```

#### C) 404 Not Found
```
Erro: GET http://localhost:3000/uploads/abc.png 404
Solução: Arquivo não existe na pasta uploads
```

#### D) URL incorreta
```
Problema: URL está como localhost:5174 ao invés de 3000
Solução: Verificar função getImageUrl()
```

## 🧪 Teste Manual

### Criar Novo Item COM Imagem

1. Vá em Estoque → + Novo Item
2. Preencha TODOS os campos obrigatórios
3. **IMPORTANTE**: Escolha uma imagem
4. Veja o preview (deve aparecer)
5. Clique em Cadastrar
6. Vá nos detalhes do item criado
7. A imagem deve aparecer

### Verificar no Banco

Execute no Prisma Studio ou SQL:
```sql
SELECT id, name, imageUrl FROM stock_items 
WHERE id = 'ba5f7313-5c36-4070-8557-b40d490b9bb3';
```

O campo `imageUrl` está preenchido?

## 📸 O que Esperar

### Console (F12):
```
📦 Item carregado: {id: "...", name: "...", imageUrl: "/uploads/abc.png", ...}
🖼️ ImageURL: /uploads/c5350373-7274-4189-b765-dce6bb65b25f.png
🌐 URL completa: http://localhost:3000/uploads/c5350373-7274-4189-b765-dce6bb65b25f.png
```

### Network (F12):
```
GET http://localhost:3000/uploads/c5350373-7274-4189-b765-dce6bb65b25f.png
Status: 200 OK
Type: image/png
```

### Elemento HTML:
```html
<img 
  src="http://localhost:3000/uploads/c5350373-7274-4189-b765-dce6bb65b25f.png"
  alt="Cerveja Brahma lata 350ml"
  class="w-full h-full object-cover"
>
```

## 🎯 Próximos Passos

1. **Recarregue a página** (F5)
2. **Abra o console** (F12)
3. **Veja os logs** que adicionei
4. **Me mostre** o que aparece no console

Com essas informações, posso identificar exatamente onde está o problema!
