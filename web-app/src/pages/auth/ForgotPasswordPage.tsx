export function ForgotPasswordPage() {
  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recuperar Senha</h2>
        <p className="text-gray-600 mt-1">Digite seu email para receber instruções</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="seu@email.com"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          Enviar Instruções
        </button>
      </form>

      <div className="mt-4 text-center">
        <a href="/auth/login" className="text-sm text-orange-600 hover:text-orange-700">
          Voltar ao login
        </a>
      </div>
    </>
  );
}
