# ❓ Perguntas Frequentes (FAQ)

## 🎯 Geral

### P: Preciso ter Docker instalado?
**R:** Não! Você pode usar serviços online gratuitos (Neon + Upstash) ou instalar PostgreSQL e Redis localmente. Veja **INICIO_RAPIDO_SEM_DOCKER.md**.

### P: Quanto tempo leva para configurar tudo?
**R:** 
- Com Docker: ~5 minutos
- Com serviços online: ~10 minutos
- Com instalação local: ~15-20 minutos

### P: É grátis?
**R:** Sim! Tanto os serviços online (Neon e Upstash) quanto as instalações locais são gratuitos.

### P: Funciona no Windows?
**R:** Sim! Todos os guias foram feitos para Windows. Incluímos scripts .bat para facilitar.

---

## 🐳 Docker

### P: Não consigo instalar Docker Desktop, e agora?
**R:** Use a **Opção 2** (serviços online). É até mais fácil! Veja **INICIO_RAPIDO_SEM_DOCKER.md**.

### P: Docker está muito lento no meu PC
**R:** Use serviços online (Neon + Upstash). Eles rodam na nuvem e não usam recursos do seu PC.

### P: Erro "Docker daemon is not running"
**R:** Você tem duas opções:
1. Inicie o Docker Desktop
2. Use serviços online (recomendado se não tem Docker)

---

## 🗄️ Banco de Dados

### P: Preciso instalar PostgreSQL?
**R:** Não! Use o Neon (https://neon.tech) - é PostgreSQL na nuvem, grátis e já configurado.

### P: Como sei se meu banco está funcionando?
**R:** Execute `node test-api.js` ou acesse http://localhost:3000/health

### P: Erro "Cannot reach database server"
**R:** Verifique:
1. DATABASE_URL está correto no .env.development
2. Tem `?sslmode=require` no final (para Neon)
3. Teste a conexão no dashboard do Neon

### P: Como vejo os dados no banco?
**R:** Execute `npm run prisma:studio` e abra http://localhost:5555

### P: Posso usar MySQL ao invés de PostgreSQL?
**R:** Tecnicamente sim, mas precisaria ajustar o schema do Prisma. PostgreSQL é recomendado.

---

## 🔴 Redis

### P: Preciso instalar Redis?
**R:** Não! Use o Upstash (https://upstash.com) - é Redis na nuvem, grátis e já configurado.

### P: Para que serve o Redis?
**R:** Cache de dados para melhorar a performance da API. Sem ele, a API fica mais lenta.

### P: Erro "Redis connection failed"
**R:** Verifique:
1. REDIS_URL está correto no .env.development
2. URL começa com `rediss://` (dois 's')
3. Teste no dashboard do Upstash

### P: Posso rodar sem Redis?
**R:** Tecnicamente sim, mas não é recomendado. O Redis melhora muito a performance.

---

## ⚙️ Configuração

### P: Onde fica o arquivo de configuração?
**R:** `.env.development` na raiz do projeto.

### P: Não encontro o arquivo .env.development
**R:** Copie o `.env.development.example`:
```bash
copy .env.development.example .env.development
```

### P: Quais variáveis são obrigatórias?
**R:** 
- `DATABASE_URL` - Conexão com PostgreSQL
- `REDIS_URL` - Conexão com Redis
- `JWT_SECRET` - Chave para tokens
- `PORT` - Porta da API (padrão: 3000)

### P: Como gero um JWT_SECRET seguro?
**R:** Execute no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 Execução

### P: Como inicio a API?
**R:** Execute `npm run dev` no terminal.

### P: Erro "Port 3000 already in use"
**R:** Mude a porta no `.env.development`:
```env
PORT=3001
```

### P: Como paro a API?
**R:** Pressione `Ctrl + C` no terminal onde está rodando.

### P: A API não inicia
**R:** Execute em ordem:
1. `node verificar-setup.js` (verifica problemas)
2. `npm install` (instala dependências)
3. `npm run prisma:generate` (gera cliente)
4. `npm run prisma:migrate` (cria tabelas)
5. `npm run dev` (inicia API)

---

## 🧪 Testes

### P: Como testo se está funcionando?
**R:** Três formas:
1. Execute `node test-api.js` (automático)
2. Acesse http://localhost:3000/api/docs (visual)
3. Acesse http://localhost:3000/health (rápido)

### P: Erro "Cannot GET /api/docs"
**R:** Verifique se a API está rodando (`npm run dev`).

### P: Como faço login na API?
**R:** Use as credenciais do seed:
- Email: `admin@restaurant.com`
- Senha: `admin123`

### P: Onde consigo o token JWT?
**R:** Faça login no endpoint `/api/v1/auth/login` e copie o token da resposta.

---

## 📦 Dependências

### P: Erro ao executar npm install
**R:** Verifique:
1. Node.js 20+ está instalado (`node --version`)
2. npm está atualizado (`npm --version`)
3. Tem conexão com internet
4. Não está atrás de proxy/firewall

### P: Demora muito para instalar
**R:** Normal na primeira vez. Pode levar 2-5 minutos dependendo da internet.

### P: Erro "EACCES: permission denied"
**R:** No Windows, execute o terminal como Administrador.

---

## 🔧 Prisma

### P: O que é Prisma?
**R:** ORM (Object-Relational Mapping) que facilita trabalhar com banco de dados.

### P: Erro "relation does not exist"
**R:** Execute:
```bash
npm run prisma:migrate
npm run prisma:seed
```

### P: Como crio novas tabelas?
**R:** 
1. Edite `prisma/schema.prisma`
2. Execute `npm run prisma:migrate`

### P: Como vejo as migrations?
**R:** Veja a pasta `prisma/migrations/`

### P: Posso resetar o banco?
**R:** Sim:
```bash
npm run prisma:migrate reset
npm run prisma:seed
```
⚠️ Isso apaga todos os dados!

---

## 🔐 Segurança

### P: É seguro usar em produção?
**R:** Sim! Mas configure:
1. JWT_SECRET forte (32+ caracteres)
2. HTTPS obrigatório
3. Senhas fortes para banco
4. CORS configurado corretamente

### P: Como mudo a senha do admin?
**R:** Edite `prisma/seed.ts` e execute `npm run prisma:seed`.

### P: Posso usar em produção com Neon/Upstash?
**R:** Sim para desenvolvimento/testes. Para produção com tráfego alto, considere planos pagos ou servidores próprios.

---

## 📊 Performance

### P: A API está lenta
**R:** Verifique:
1. Redis está conectado?
2. Índices do banco estão criados?
3. Está usando paginação nas listagens?

### P: Como melhoro a performance?
**R:** Já implementado:
- ✅ Cache Redis (5 min TTL)
- ✅ Compression HTTP
- ✅ Índices no banco
- ✅ Paginação
- ✅ Queries otimizadas

---

## 🐛 Erros Comuns

### P: "Cannot find module '@/config/database'"
**R:** Execute `npm run prisma:generate`

### P: "Unexpected token 'export'"
**R:** Use Node.js 20+ e execute `npm run dev` (não `node src/server.ts`)

### P: "ECONNREFUSED"
**R:** O serviço (PostgreSQL ou Redis) não está rodando ou URL está errada.

### P: "Invalid connection string"
**R:** Verifique o formato da DATABASE_URL no .env.development

### P: Tela preta no terminal
**R:** Normal! A API está rodando. Pressione Ctrl+C para parar.

---

## 📱 Desenvolvimento

### P: Como adiciono novos endpoints?
**R:** 
1. Crie controller em `src/controllers/`
2. Crie service em `src/services/`
3. Crie repository em `src/repositories/`
4. Adicione rota em `src/routes/`

### P: Como adiciono novas tabelas?
**R:**
1. Edite `prisma/schema.prisma`
2. Execute `npm run prisma:migrate`
3. Crie repository/service/controller

### P: Preciso reiniciar a API após mudanças?
**R:** Não! O `npm run dev` tem hot-reload automático.

### P: Como vejo os logs?
**R:** Aparecem no terminal onde você executou `npm run dev`.

---

## 🎯 Próximos Passos

### P: O que fazer depois de rodar a API?
**R:**
1. Teste todos os endpoints no Swagger
2. Explore os dados no Prisma Studio
3. Crie produtos e categorias
4. Parta para Prioridade 2 (Sistema de Comandas)

### P: Onde está a documentação da API?
**R:** http://localhost:3000/api/docs (Swagger UI)

### P: Como desenvolvo o frontend?
**R:** A API está pronta! Agora você pode:
1. Criar o Design System (Prioridade 3)
2. Desenvolver os apps (Mobile, Web, etc.)

---

## 💰 Custos

### P: Quanto custa rodar tudo?
**R:** **GRÁTIS!** 
- Neon: Plano free (3 projetos, 3GB)
- Upstash: Plano free (10k comandos/dia)
- Node.js: Grátis
- Código: Open source

### P: Quando preciso pagar?
**R:** Só em produção com muito tráfego:
- Neon Pro: $19/mês
- Upstash Pro: $10/mês
- Ou migre para servidores próprios

### P: Posso usar comercialmente?
**R:** Sim! O código é MIT License.

---

## 🆘 Suporte

### P: Onde busco ajuda?
**R:** Nesta ordem:
1. Este FAQ
2. Seção Troubleshooting dos guias
3. Execute `node verificar-setup.js`
4. Consulte os guias específicos

### P: Qual guia devo ler?
**R:**
- Iniciante: **INICIO_RAPIDO_SEM_DOCKER.md**
- Visual: **GUIA_VISUAL.md**
- Completo: **QUICKSTART.md**
- Referência: **COMANDOS_UTEIS.md**

### P: Como reporto um bug?
**R:** Verifique primeiro se:
1. Seguiu todos os passos
2. Variáveis de ambiente estão corretas
3. Dependências estão instaladas
4. Serviços estão rodando

---

## 🎓 Aprendizado

### P: Preciso saber TypeScript?
**R:** Ajuda, mas não é obrigatório. O código está bem documentado.

### P: Preciso saber Docker?
**R:** Não! Use a opção sem Docker (serviços online).

### P: Preciso saber SQL?
**R:** Não! O Prisma abstrai o SQL. Mas ajuda para queries complexas.

### P: Onde aprendo mais sobre as tecnologias?
**R:**
- Node.js: https://nodejs.org/docs
- TypeScript: https://www.typescriptlang.org/docs
- Prisma: https://www.prisma.io/docs
- Express: https://expressjs.com

---

## 📚 Documentação

### P: Onde está a documentação completa?
**R:** Vários lugares:
- API: http://localhost:3000/api/docs
- Código: Comentários nos arquivos
- Guias: Pasta raiz do projeto
- README.md: Visão geral

### P: Como documento meus endpoints?
**R:** Use comentários JSDoc com anotações Swagger. Veja exemplos em `src/routes/`.

---

**Não encontrou sua pergunta? Consulte os guias específicos ou execute `node verificar-setup.js` para diagnóstico!** 🔍
