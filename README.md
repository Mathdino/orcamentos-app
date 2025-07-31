# Painter Mobile App

Este projeto é uma aplicação web desenvolvida com Next.js, Prisma e PostgreSQL para gerenciamento de orçamentos de pintura.

## Pré-requisitos

- Node.js (recomendado: v18 ou superior)
- pnpm (ou npm/yarn)
- PostgreSQL (local ou em nuvem)

## Passo a passo para rodar o projeto

### 1. Instale as dependências

```
pnpm install
```

### 2. Configure o banco de dados

Crie um banco de dados PostgreSQL. Anote a URL de conexão, que será usada na configuração do ambiente.

Exemplo de URL:
```
postgresql://usuario:senha@localhost:5432/nome_do_banco
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
```

Substitua `usuario`, `senha` e `nome_do_banco` pelos seus dados reais do PostgreSQL.

### 4. Rode as migrations do Prisma

```
npx prisma migrate deploy
```

Ou, para ambiente de desenvolvimento:
```
npx prisma migrate dev
```

### 5. Inicie a aplicação

Para rodar em modo desenvolvimento:
```
pnpm dev
```

Acesse em: http://localhost:3000

---

## Scripts úteis

- `pnpm dev` — Inicia o servidor de desenvolvimento
- `pnpm build` — Gera a build de produção
- `pnpm start` — Inicia a aplicação em modo produção
- `npx prisma studio` — Abre o Prisma Studio para gerenciar dados

## Estrutura do banco de dados

O banco é definido em [`prisma/schema.prisma`](prisma/schema.prisma) e inclui modelos para clientes, orçamentos, materiais e pagamentos.

---

Se tiver dúvidas, consulte o código ou abra uma issue! 