# 🎯 CNPJ Válido para Testes

## ❌ Problema Identificado

O CNPJ `12345678000901` que você está usando **não é válido** porque os dígitos verificadores estão incorretos.

O backend valida os dígitos verificadores usando o algoritmo oficial da Receita Federal.

---

## ✅ CNPJs Válidos para Teste

Use um destes CNPJs que têm dígitos verificadores corretos:

### Opção 1 (Recomendado)
```
11222333000181
```
**Formatado:** `11.222.333/0001-81`

### Opção 2
```
11444777000161
```
**Formatado:** `11.444.777/0001-61`

### Opção 3
```
34028316000103
```
**Formatado:** `34.028.316/0001-03`

### Opção 4
```
07526557000162
```
**Formatado:** `07.526.557/0001-62`

---

## 🧪 Dados Completos para Teste

Copie e cole estes dados no formulário:

### Etapa 1 - Dados Pessoais
```
Nome: João Silva
Email: joao.teste@exemplo.com
Telefone: (11) 98765-4321
Senha: Admin@123
Confirmar Senha: Admin@123
```

### Etapa 2 - Dados do Estabelecimento
```
Nome do Estabelecimento: Restaurante do João
CNPJ: 11222333000181
Rua: Rua Principal
Número: 100
Complemento: (deixar vazio ou preencher)
Bairro: Centro
Cidade: São Paulo
Estado: SP
CEP: 01310-100
Telefone: (11) 3456-7890
Email: contato@restaurante.com
```

---

## 📋 Formato do CNPJ

O CNPJ pode ser enviado de duas formas:

### Com formatação
```
11.222.333/0001-81
```

### Sem formatação
```
11222333000181
```

**Ambos funcionam!** O backend aceita os dois formatos.

---

## 🔍 Como Funciona a Validação

O CNPJ tem 14 dígitos:
```
11.222.333/0001-81
│  │   │   │    └─ Dígito verificador 2
│  │   │   └────── Dígito verificador 1
│  │   └────────── Número de ordem
│  └────────────── Número básico
└───────────────── Raiz
```

Os 2 últimos dígitos são calculados usando um algoritmo específico. Se estiverem errados, o CNPJ é inválido.

---

## ⚠️ CNPJs Inválidos (NÃO USE)

Estes CNPJs **NÃO funcionam** porque têm dígitos verificadores incorretos:

- ❌ `12345678000190`
- ❌ `12345678000901`
- ❌ `11111111111111` (todos iguais)
- ❌ `00000000000000` (todos zeros)

---

## 🎯 Teste Agora!

1. **Recarregue a página** (Ctrl + Shift + R)
2. **Preencha o formulário** com os dados acima
3. **Use o CNPJ:** `11222333000181`
4. **Clique em "Criar Conta"**

Deve funcionar! ✅

---

## 🔧 Gerando Seus Próprios CNPJs Válidos

Se precisar de mais CNPJs para teste, você pode usar geradores online:

- https://www.4devs.com.br/gerador_de_cnpj
- https://www.geradorcnpj.com/

**Importante:** Use apenas para testes em ambiente de desenvolvimento!

---

## 📝 Resumo

**Problema:** CNPJ com dígitos verificadores incorretos
**Solução:** Use `11222333000181`
**Status:** ✅ Pronto para testar!
