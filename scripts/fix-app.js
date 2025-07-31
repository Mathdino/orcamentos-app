#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔧 Iniciando correção da aplicação...\n");

try {
  // 1. Limpar cache do Next.js
  console.log("1️⃣ Limpando cache do Next.js...");
  const nextDir = path.join(process.cwd(), ".next");
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log("✅ Cache do Next.js removido");
  } else {
    console.log("ℹ️ Cache do Next.js não encontrado");
  }

  // 2. Limpar node_modules (opcional)
  console.log("\n2️⃣ Verificando dependências...");
  const nodeModulesDir = path.join(process.cwd(), "node_modules");
  if (!fs.existsSync(nodeModulesDir)) {
    console.log("⚠️ node_modules não encontrado, reinstalando...");
    execSync("pnpm install", { stdio: "inherit" });
  } else {
    console.log("✅ node_modules encontrado");
  }

  // 3. Gerar cliente Prisma
  console.log("\n3️⃣ Gerando cliente Prisma...");
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("✅ Cliente Prisma gerado");
  } catch (error) {
    console.log("❌ Erro ao gerar cliente Prisma:", error.message);
  }

  // 4. Verificar migrations
  console.log("\n4️⃣ Verificando migrations...");
  try {
    execSync("npx prisma migrate status", { stdio: "inherit" });
  } catch (error) {
    console.log("❌ Erro ao verificar migrations:", error.message);
  }

  console.log("\n🎉 Correção concluída!");
  console.log("\n📋 Próximos passos:");
  console.log("1. Execute: pnpm dev");
  console.log("2. Acesse: http://localhost:3000/debug");
  console.log(
    "3. Se houver problemas com migrations, execute: npx prisma migrate deploy"
  );
} catch (error) {
  console.error("❌ Erro durante a correção:", error.message);
}
