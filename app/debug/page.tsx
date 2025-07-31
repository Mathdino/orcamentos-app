import { testarConexaoDB } from "../actions/test-db";

export default async function DebugPage() {
  const resultado = await testarConexaoDB();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        🔧 Debug - Diagnóstico Completo
      </h1>

      {/* Teste de Conexão com Banco */}
      <div
        className={`p-4 rounded-lg mb-6 ${
          resultado.success
            ? "bg-green-100 border border-green-400"
            : "bg-red-100 border border-red-400"
        }`}
      >
        <h2 className="font-semibold mb-2">
          {resultado.success
            ? "✅ Conexão com Banco OK"
            : "❌ Erro na Conexão com Banco"}
        </h2>

        {resultado.success ? (
          <div>
            <p className="text-green-800">{resultado.message}</p>
            <p className="text-green-800">
              Clientes no banco: {resultado.clienteCount}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-red-800">Erro: {resultado.error}</p>
          </div>
        )}
      </div>

      {/* Informações do Sistema */}
      <div className="p-4 bg-blue-100 border border-blue-400 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">📊 Informações do Sistema:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>Node.js:</strong> {process.version}
            </p>
            <p>
              <strong>Next.js:</strong> 15.2.4
            </p>
            <p>
              <strong>React:</strong> 19
            </p>
            <p>
              <strong>TypeScript:</strong> 5
            </p>
          </div>
          <div>
            <p>
              <strong>Ambiente:</strong> {process.env.NODE_ENV || "development"}
            </p>
            <p>
              <strong>Plataforma:</strong> {process.platform}
            </p>
            <p>
              <strong>Arquitetura:</strong> {process.arch}
            </p>
          </div>
        </div>
      </div>

      {/* Checklist de Solução */}
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">
          📋 Checklist para Resolver Problemas:
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>✅ Verificar se o PostgreSQL está rodando</li>
          <li>✅ Verificar arquivo .env e DATABASE_URL</li>
          <li>
            ⚠️ Executar migrations: <code>npx prisma migrate deploy</code>
          </li>
          <li>
            ⚠️ Verificar se todas as dependências estão instaladas:{" "}
            <code>pnpm install</code>
          </li>
          <li>
            ⚠️ Limpar cache do Next.js: <code>rm -rf .next</code>
          </li>
          <li>
            ⚠️ Reiniciar servidor: <code>pnpm dev</code>
          </li>
        </ol>
      </div>

      {/* Comandos Úteis */}
      <div className="p-4 bg-gray-100 border border-gray-400 rounded-lg">
        <h3 className="font-semibold mb-2">🛠️ Comandos Úteis:</h3>
        <div className="space-y-2 text-sm">
          <div className="bg-white p-2 rounded border">
            <p className="font-mono text-xs">
              # Verificar status das migrations
            </p>
            <code className="text-xs">npx prisma migrate status</code>
          </div>
          <div className="bg-white p-2 rounded border">
            <p className="font-mono text-xs"># Aplicar migrations</p>
            <code className="text-xs">npx prisma migrate deploy</code>
          </div>
          <div className="bg-white p-2 rounded border">
            <p className="font-mono text-xs"># Gerar cliente Prisma</p>
            <code className="text-xs">npx prisma generate</code>
          </div>
          <div className="bg-white p-2 rounded border">
            <p className="font-mono text-xs"># Abrir Prisma Studio</p>
            <code className="text-xs">npx prisma studio</code>
          </div>
        </div>
      </div>

      {/* Links de Teste */}
      <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
        <h3 className="font-semibold mb-2">🔗 Links de Teste:</h3>
        <div className="space-y-2">
          <a href="/" className="block text-blue-600 hover:underline">
            🏠 Página Inicial
          </a>
          <a
            href="/novo-orcamento"
            className="block text-blue-600 hover:underline"
          >
            📝 Novo Orçamento
          </a>
          <a href="/orcamentos" className="block text-blue-600 hover:underline">
            📋 Lista de Orçamentos
          </a>
          <a href="/clientes" className="block text-blue-600 hover:underline">
            👥 Clientes
          </a>
        </div>
      </div>
    </div>
  );
}
