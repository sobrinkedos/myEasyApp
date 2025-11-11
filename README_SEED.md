# 🌱 Seed do Banco de Dados

## ⚡ Início Rápido

```bash
# Windows
seed-prisma.bat

# Ou manualmente
npx ts-node prisma/seed.ts
```

## 🔐 Login

Após executar o seed, use as credenciais exibidas no terminal:

```
Email: admin@sistema.com
Senha: [senha gerada aleatoriamente]
```

**⚠️ Anote a senha exibida no terminal!**

## ✅ O que é criado

- ✅ Super Admin com **62 permissões**
- ✅ 10 roles (ADMIN, MANAGER, WAITER, etc.)
- ✅ Estabelecimento padrão
- ✅ 5 categorias
- ✅ 10 ingredientes
- ✅ 3 receitas completas
- ✅ 11 produtos
- ✅ 4 stock items
- ✅ 8 mesas
- ✅ 1 caixa

## 🧹 Limpar Duplicados

Se você executou o seed múltiplas vezes e tem dados duplicados:

```bash
npx ts-node scripts/clean-duplicates.ts
```

Depois execute o seed novamente.

## 🔍 Verificar Permissões

Para verificar se o usuário tem todas as permissões:

```bash
npx ts-node scripts/verify-permissions.ts
```

## 📚 Mais Informações

- **SOLUCAO_FINAL.md** - Documentação completa
- **prisma/seed.ts** - Código do seed

---

**Tudo pronto! Agora você pode deletar stock items e fazer qualquer operação sem erro 403!** 🎉
