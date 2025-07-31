#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Verificando configuração do ambiente...\n");

// Verificar se existe arquivo .env
const envPath = path.join(process.cwd(), ".env");
const envLocalPath = path.join(process.cwd(), ".env.local");

let envExists = false;
let envContent = "";

if (fs.existsSync(envPath)) {
  envExists = true;
  envContent = fs.readFileSync(envPath, "utf8");
  console.log("✅ Arquivo .env encontrado");
} else if (fs.existsSync(envLocalPath)) {
  envExists = true;
  envContent = fs.readFileSync(envLocalPath, "utf8");
  console.log("✅ Arquivo .env.local encontrado");
} else {
  console.log("❌ Nenhum arquivo .env encontrado");
}

// Verificar DATABASE_URL
if (envExists) {
  const hasDatabaseUrl = envContent.includes("DATABASE_URL");
  if (hasDatabaseUrl) {
    console.log("✅ DATABASE_URL configurado");
  } else {
    console.log("❌ DATABASE_URL não encontrado no arquivo .env");
  }
} else {
  console.log("❌ DATABASE_URL não configurado (arquivo .env não existe)");
}

console.log("\n📋 Para resolver o erro 500, siga estes passos:");
console.log("\n1. Crie um arquivo .env na raiz do projeto:");
console.log("   touch .env");
console.log("\n2. Adicione a configuração do banco de dados:");
console.log(
  '   DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"'
);
console.log("\n3. Execute as migrations:");
console.log("   npx prisma migrate deploy");
console.log("\n4. Reinicie o servidor:");
console.log("   pnpm dev");
console.log("\n5. Teste a conexão acessando:");
console.log("   http://localhost:3000/debug");
