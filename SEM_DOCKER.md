# 🚀 Executar SEM Docker - Windows

## Opções Disponíveis

### Opção 1: PostgreSQL e Redis Nativos (Recomendado)
### Opção 2: PostgreSQL e Redis Portáteis
### Opção 3: Usar Serviços Online Gratuitos

---

## 📦 Opção 1: Instalação Nativa (Mais Estável)

### 1.1 Instalar PostgreSQL

**Download:**
- Acesse: https://www.postgresql.org/download/windows/
- Baixe o instalador (versão 16 recomendada)
- Execute o instalador

**Durante a instalação:**
- Porta: `5432` (padrão)
- Senha do superusuário: `postgres` (anote!)
- Locale: `Portuguese, Brazil`

**Após instalar:**
```bash
# Verificar se está rodando
psql --version

# Criar banco de dados
psql -U postgres
# Digite a senha que você configurou
# No prompt do PostgreSQL:
CREATE DATABASE restaurant_dev;
CREATE USER restaurant_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE restaurant_dev TO restaurant_user;
\q
```

### 1.2 Instalar Redis

**Opção A - Via Chocolatey (Recomendado):**
```bash
# Instalar Chocolatey (se não tiver)
# Execute PowerShell como Administrador:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Redis
choco install redis-64 -y

# Iniciar Redis
redis-server
```

**Opção B - Download Manual:**
- Acesse: https://github.com/microsoftarchive/redis/releases
- Baixe: `Redis-x64-3.0.504.msi`
- Instale normalmente
- Redis iniciará automaticamente como serviço

**Verificar:**
```bash
redis-cli ping
# Deve retornar: PONG
```

### 1.3 Configurar Variáveis de Ambiente

Edite o arquivo `.env.development`:

```env
NODE_ENV=development
PORT=3000

# PostgreSQL Local
DATABASE_URL=postgresql://restaurant_user:dev_password@localhost:5432/restaurant_dev

# Redis Local
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_EXPIRES_IN=24h

# Bcrypt
BCRYPT_ROUNDS=10

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=debug
```

### 1.4 Executar a Aplicação

```bash
# 1. Instalar dependências
npm install

# 2. Gerar cliente Prisma
npm run prisma:generate

# 3. Criar tabelas
npm run prisma:migrate

# 4. Popular banco
npm run prisma:seed

# 5. Iniciar API
npm run dev
```

---

## 📦 Opção 2: Versões Portáteis (Sem Instalação)

### 2.1 PostgreSQL Portátil

**Download:**
- Acesse: https://www.enterprisedb.com/download-postgresql-binaries
- Baixe a versão ZIP (não o instalador)
- Extraia para: `C:\PostgreSQL-Portable`

**Configurar:**
```bash
# Abra PowerShell na pasta extraída
cd C:\PostgreSQL-Portable\pgsql\bin

# Inicializar banco de dados
.\initdb.exe -D ..\data -U postgres -W -E UTF8 -A scram-sha-256

# Iniciar servidor
.\pg_ctl.exe -D ..\data -l logfile start

# Criar banco
.\psql.exe -U postgres
# No prompt:
CREATE DATABASE restaurant_dev;
CREATE USER restaurant_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE restaurant_dev TO restaurant_user;
\q
```

**Para parar:**
```bash
.\pg_ctl.exe -D ..\data stop
```

### 2.2 Redis Portátil

**Download:**
- Acesse: https://github.com/tporadowski/redis/releases
- Baixe: `Redis-x64-5.0.14.1.zip`
- Extraia para: `C:\Redis-Portable`

**Executar:**
```bash
cd C:\Redis-Portable
.\redis-server.exe
```

**Deixe este terminal aberto!**

---

## ☁️ Opção 3: Serviços Online Gratuitos

### 3.1 PostgreSQL Online

**Opção A - Neon (Recomendado):**
1. Acesse: https://neon.tech
2. Crie conta gratuita
3. Crie um projeto
4. Copie a connection string
5. Cole no `.env.development`:
```env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

**Opção B - ElephantSQL:**
1. Acesse: https://www.elephantsql.com
2. Crie conta gratuita
3. Crie uma instância (Tiny Turtle - Free)
4. Copie a URL
5. Cole no `.env.development`

**Opção C - Supabase:**
1. Acesse: https://supabase.com
2. Crie projeto gratuito
3. Vá em Settings > Database
4. Copie a connection string
5. Cole no `.env.development`

### 3.2 Redis Online

**Opção A - Upstash (Recomendado):**
1. Acesse: https://upstash.com
2. Crie conta gratuita
3. Crie um Redis database
4. Copie a URL
5. Cole no `.env.development`:
```env
REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
```

**Opção B - Redis Cloud:**
1. Acesse: https://redis.com/try-free
2. Crie conta gratuita
3. Crie um database
4. Copie a connection string
5. Cole no `.env.development`

---

## 🚀 Executar Após Configurar

Independente da opção escolhida:

```bash
# 1. Instalar dependências
npm install

# 2. Gerar cliente Prisma
npm run prisma:generate

# 3. Criar tabelas
npm run prisma:migrate

# 4. Popular banco
npm run prisma:seed

# 5. Iniciar API
npm run dev

# 6. Testar
node test-api.js
```

---

## 🎯 Recomendação por Situação

### Para Desenvolvimento Local:
✅ **Opção 1** (Nativo) - Mais rápido e estável

### Sem Permissão de Instalação:
✅ **Opção 2** (Portátil) - Funciona sem admin

### Computador Limitado:
✅ **Opção 3** (Online) - Não usa recursos locais

### Para Testes Rápidos:
✅ **Opção 3** (Online) - Setup mais rápido

---

## 📝 Scripts Úteis

### Iniciar PostgreSQL Portátil
Crie `start-postgres.bat`:
```batch
@echo off
cd C:\PostgreSQL-Portable\pgsql\bin
start "PostgreSQL" .\pg_ctl.exe -D ..\data -l logfile start
echo PostgreSQL iniciado!
pause
```

### Iniciar Redis Portátil
Crie `start-redis.bat`:
```batch
@echo off
cd C:\Redis-Portable
start "Redis" .\redis-server.exe
echo Redis iniciado!
pause
```

### Iniciar Tudo
Crie `start-all.bat`:
```batch
@echo off
echo Iniciando servicos...

REM Iniciar PostgreSQL
cd C:\PostgreSQL-Portable\pgsql\bin
start "PostgreSQL" .\pg_ctl.exe -D ..\data -l logfile start

REM Aguardar 2 segundos
timeout /t 2 /nobreak > nul

REM Iniciar Redis
cd C:\Redis-Portable
start "Redis" .\redis-server.exe

REM Aguardar 2 segundos
timeout /t 2 /nobreak > nul

REM Voltar para pasta do projeto
cd %~dp0

echo.
echo ✅ PostgreSQL e Redis iniciados!
echo.
echo Agora execute: npm run dev
echo.
pause
```

---

## 🐛 Troubleshooting

### PostgreSQL não inicia
```bash
# Verificar se a porta 5432 está em uso
netstat -ano | findstr :5432

# Matar processo se necessário
taskkill /PID <PID> /F

# Ou mudar a porta no postgresql.conf
```

### Redis não inicia
```bash
# Verificar se a porta 6379 está em uso
netstat -ano | findstr :6379

# Matar processo se necessário
taskkill /PID <PID> /F
```

### Erro de conexão no Prisma
```bash
# Testar conexão manualmente
psql -U restaurant_user -d restaurant_dev -h localhost

# Verificar se o DATABASE_URL está correto
echo %DATABASE_URL%
```

### Erro "relation does not exist"
```bash
# Recriar banco
npm run prisma:migrate reset
npm run prisma:seed
```

---

## 💡 Dicas

1. **Portátil é mais simples** - Não precisa de permissões de admin
2. **Online é mais prático** - Não precisa gerenciar serviços
3. **Nativo é mais rápido** - Melhor performance
4. **Sempre teste a conexão** antes de rodar migrations
5. **Mantenha backups** dos dados importantes

---

**Escolha a opção que melhor se adequa à sua situação e siga os passos!** 🚀
