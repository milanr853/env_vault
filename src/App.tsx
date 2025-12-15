export default function App() {
    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <header className="border-b bg-white px-6 py-4 shadow-sm">
                <h1 className="text-lg font-semibold tracking-tight">
                    🔐 Env Vault
                </h1>
                <p className="text-sm text-gray-500">
                    Local-First Secrets Manager
                </p>
            </header>

            {/* Main */}
            <main className="flex flex-1 items-center justify-center px-6">
                <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow">
                    <h2 className="mb-2 text-xl font-semibold">
                        Vault Locked
                    </h2>

                    <p className="mb-6 text-sm text-gray-600">
                        Enter your master password to unlock your encrypted vault.
                    </p>

                    <button
                        className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                    >
                        Unlock Vault
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white px-6 py-3 text-center text-xs text-gray-500">
                Secrets never leave your machine
            </footer>
        </div>
    )
}
