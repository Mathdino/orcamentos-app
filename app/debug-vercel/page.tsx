import { debugVercel } from "../actions/debug-vercel";

export default async function DebugVercelPage() {
  const debug = await debugVercel();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        🔧 Debug Vercel - Diagnóstico de Produção
      </h1>

      {/* Informações do Ambiente */}
      <div className="p-4 bg-blue-100 border border-blue-400 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">🌍 Informações do Ambiente:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>NODE_ENV:</strong>{" "}
              {debug.environment?.nodeEnv || "Não definido"}
            </p>
            <p>
              <strong>VERCEL_ENV:</strong>{" "}
              {debug.environment?.vercelEnv || "Não definido"}
            </p>
          </div>
          <div>
            <p>
              <strong>DATABASE_URL:</strong> {debug.environment?.databaseUrl}
            </p>
            <p>
              <strong>Timestamp:</strong> {debug.timestamp}
            </p>
          </div>
        </div>
      </div>

      {/* Status do Banco */}
      <div
        className={`p-4 rounded-lg mb-6 ${
          debug.database?.connected
            ? "bg-green-100 border border-green-400"
            : "bg-red-100 border border-red-400"
        }`}
      >
        <h2 className="font-semibold mb-2">
          {debug.database?.connected
            ? "✅ Banco Conectado"
            : "❌ Erro no Banco"}
        </h2>

        {debug.database?.connected ? (
          <div>
            <p className="text-green-800">Conexão com banco estabelecida</p>
            <p className="text-green-800">
              Clientes no banco: {debug.database.clienteCount}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-red-800">Erro: {debug.database?.error}</p>
          </div>
        )}
      </div>

      {/* Checklist para Vercel */}
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">
          📋 Checklist para Resolver na Vercel:
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            ✅ Verificar se DATABASE_URL está configurado no dashboard da Vercel
          </li>
          <li>⚠️ Verificar se o banco de produção está acessível</li>
          <li>⚠️ Aplicar migrations no banco de produção</li>
          <li>⚠️ Verificar se o banco suporta as operações do Prisma</li>
          <li>⚠️ Verificar logs da Vercel para erros específicos</li>
        </ol>
      </div>

      {/* Configuração da Vercel */}
      <div className="p-4 bg-purple-100 border border-purple-400 rounded-lg">
        <h3 className="font-semibold mb-2">⚙️ Como Configurar na Vercel:</h3>
        <div className="space-y-2 text-sm">
          <div className="bg-white p-2 rounded border">
            <p className="font-semibold">1. Dashboard da Vercel:</p>
            <p>• Vá para seu projeto na Vercel</p>
            <p>• Settings → Environment Variables</p>
            <p>
              • Adicione: <code>DATABASE_URL</code> com a URL do seu banco
            </p>
          </div>
          <div className="bg-white p-2 rounded border">
            <p className="font-semibold">2. Banco de Produção:</p>
            <p>• Use PostgreSQL na nuvem (Supabase, Neon, etc.)</p>
            <p>
              • Aplique migrations: <code>npx prisma migrate deploy</code>
            </p>
            <p>
              • Gere cliente: <code>npx prisma generate</code>
            </p>
          </div>
          <div className="bg-white p-2 rounded border">
            <p className="font-semibold">3. Build Settings:</p>
            <p>
              • Adicione build command:{" "}
              <code>npx prisma generate && next build</code>
            </p>
            <p>
              • Ou use: <code>pnpm prisma generate && pnpm build</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
