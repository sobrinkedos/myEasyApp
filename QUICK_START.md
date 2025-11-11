# 🚀 Quick Start - Seed de Dados de Teste

## ⚡ Início Rápido

### 1. Executar Seed
```bash
seed-test-data.bat
```

### 2. Login
```
Email: admin@saborarte.com.br
Senha: admin123
```

### 3. Pronto! 🎉

Você agora tem:
- ✅ Usuário admin com **todas as permissões**
- ✅ 18 ingredientes
- ✅ 6 receitas completas
- ✅ 6 produtos manufaturados
- ✅ 6 stock items para revenda
- ✅ 4 categorias
- ✅ Imagens dos produtos

## 🔍 Verificar Permissões

```bash
verify-permissions.bat
```

Isso mostrará todas as 42 permissões do usuário admin.

## 📚 Documentação Completa

- **SEED_TEST_DATA.md** - Documentação detalhada
- **SEED_PERMISSIONS_ADDED.md** - Detalhes das permissões
- **SEED_COMPLETE_SUMMARY.md** - Resumo completo

## ❓ Problemas?

### Erro: "Unique constraint failed"
O seed já foi executado. Ele é idempotente, então pode executar novamente sem problemas.

### Erro: "403 Forbidden"
Execute o script de verificação para confirmar que as permissões foram aplicadas:
```bash
verify-permissions.bat
```

### Banco de dados quebrado
Recrie o banco:
```bash
npx prisma db push --force-reset
seed-test-data.bat
```

## 🎯 O que Testar

Agora você pode testar:
- ✅ Deletar stock items
- ✅ Criar/editar produtos
- ✅ Gerenciar receitas
- ✅ Criar comandas
- ✅ Processar pedidos
- ✅ Abrir/fechar caixa
- ✅ Visualizar relatórios

**Tudo funciona! O usuário admin tem acesso total.**
