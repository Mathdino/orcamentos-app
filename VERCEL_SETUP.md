# 🚀 Guia de Configuração da Vercel

## 🔍 Problema Identificado

O erro 500 na Vercel (mas funcionando no localhost) geralmente é causado por:

1. **Variáveis de ambiente não configuradas**
2. **Banco de dados não acessível**
3. **Migrations não aplicadas**
4. **Cliente Prisma não gerado**

## 📋 Checklist de Solução

### 1. 🗄️ Configurar Banco de Produção

**Opções recomendadas:**

- **Supabase** (gratuito até 500MB)
- **Neon** (gratuito até 3GB)
- **PlanetScale** (gratuito até 1GB)

**Exemplo com Supabase:**

```bash
# 1. Crie uma conta em supabase.com
# 2. Crie um novo projeto
# 3. Vá em Settings → Database
# 4. Copie a connection string
```

### 2. ⚙️ Configurar Variáveis na Vercel

1. **Acesse o dashboard da Vercel**
2. **Vá para seu projeto**
3. **Settings → Environment Variables**
4. **Adicione:**
   ```
   Nome: DATABASE_URL
   Valor: postgresql://user:password@host:port/database
   Environment: Production, Preview, Development
   ```

### 3. 🔧 Configurar Build

**No dashboard da Vercel:**

- **Settings → General**
- **Build Command:** `npx prisma generate && next build`
- **Install Command:** `pnpm install`

### 4. 📊 Aplicar Migrations

**Opção 1: Via CLI da Vercel**

```bash
# Instale Vercel CLI
npm i -g vercel

# Login
vercel login

# Aplique migrations
vercel env pull .env.production
npx prisma migrate deploy
```

**Opção 2: Via Supabase/Neon Dashboard**

```sql
-- Execute as migrations diretamente no banco
-- Copie o conteúdo de prisma/migrations/[timestamp]_migration_name.sql
```

### 5. 🧪 Testar Configuração

1. **Deploy na Vercel**
2. **Acesse:** `https://seu-app.vercel.app/debug-vercel`
3. **Verifique se:**
   - ✅ DATABASE_URL está configurado
   - ✅ Banco está conectado
   - ✅ Não há erros

## 🛠️ Comandos Úteis

```bash
# Gerar cliente Prisma
npx prisma generate

# Verificar status das migrations
npx prisma migrate status

# Aplicar migrations
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Ver logs da Vercel
vercel logs
```

## 🔍 Debug na Vercel

### 1. Verificar Logs

- **Dashboard da Vercel → Functions**
- **Clique na função com erro**
- **Verifique os logs detalhados**

### 2. Usar Página de Debug

- **Acesse:** `/debug-vercel`
- **Verifique informações do ambiente**
- **Teste conexão com banco**

### 3. Logs Específicos

Os logs agora incluem `[Vercel Debug]` para facilitar identificação.

## 🚨 Problemas Comuns

### Erro: "Database connection failed"

- ✅ Verificar se DATABASE_URL está correto
- ✅ Verificar se o banco está acessível
- ✅ Verificar se as migrations foram aplicadas

### Erro: "Prisma client not generated"

- ✅ Adicionar `npx prisma generate` no build command
- ✅ Verificar se o arquivo `vercel.json` está configurado

### Erro: "Function timeout"

- ✅ Aumentar `maxDuration` no `vercel.json`
- ✅ Otimizar queries do banco

## 📞 Suporte

Se ainda houver problemas:

1. **Verifique os logs da Vercel**
2. **Teste a página `/debug-vercel`**
3. **Compare com o funcionamento local**
4. **Verifique se o banco está funcionando**
