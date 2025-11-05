# 🚀 Instalação Rápida - Frontend

## Problema com PowerShell?

Se você está tendo erro de política de execução do PowerShell, use os scripts `.bat`:

### Opção 1: Scripts Batch (Recomendado para Windows)

**1. Instalar Dependências:**
```
Clique duas vezes em: install.bat
```

**2. Iniciar Servidor:**
```
Clique duas vezes em: start-dev.bat
```

### Opção 2: CMD (Prompt de Comando)

**1. Abrir CMD como Administrador**
- Pressione `Win + X`
- Selecione "Prompt de Comando (Admin)" ou "Windows PowerShell (Admin)"

**2. Navegar para a pasta:**
```cmd
cd C:\newProjects\myEasyApp\web-app
```

**3. Instalar:**
```cmd
npm install
```

**4. Iniciar:**
```cmd
npm run dev
```

### Opção 3: Resolver Política do PowerShell

**Abrir PowerShell como Administrador e executar:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois pode usar `npm` normalmente.

## ✅ Verificar Instalação

Após instalar, você deve ver:
- Pasta `node_modules` criada
- Arquivo `package-lock.json` atualizado

## 🌐 Acessar Aplicação

Após iniciar o servidor:
```
http://localhost:5173
```

## 🐛 Problemas Comuns

### "npm não é reconhecido"
- Node.js não está instalado ou não está no PATH
- Baixar em: https://nodejs.org/

### "Porta 5173 em uso"
- Outra aplicação está usando a porta
- Fechar outras instâncias do Vite
- Ou mudar a porta em `vite.config.ts`

### Erro de módulos
```cmd
# Deletar e reinstalar
rmdir /s /q node_modules
del package-lock.json
npm install
```

## 📞 Precisa de Ajuda?

Verifique os logs de erro e consulte:
- `README.md` - Documentação completa
- `AUTH-TESTING.md` - Guia de testes
- `QUICKSTART.md` - Guia rápido
