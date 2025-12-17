import { useEffect, useState } from "react"

export default function App() {
    const [checking, setChecking] = useState(true)
    const [vaultExists, setVaultExists] = useState<boolean | null>(null)
    const [password, setPassword] = useState("")
    const [unlocked, setUnlocked] = useState(false)
    const [error, setError] = useState<string | null>(null)


    useEffect(() => {
        async function checkVault() {
            const exists = await window?.envVault?.exists()
            setVaultExists(exists)
            setChecking(false)
        }

        checkVault()
    }, [])

    // 1️⃣ Still checking vault existence
    if (checking) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-500">
                Checking vault…
            </div>
        )
    }

    // 2️⃣ Vault is unlocked (HIGHEST PRIORITY)
    if (unlocked) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow">
                    <h1 className="mb-4 text-xl font-semibold text-green-600">
                        Vault Unlocked
                    </h1>

                    <p className="mb-6 text-sm text-gray-600">
                        Your secrets are decrypted in memory.
                    </p>

                    <button
                        className="w-full rounded bg-red-600 py-2 text-white"
                        onClick={async () => {
                            await window.envVault.lockVault()
                            setUnlocked(false)
                        }}
                    >
                        Lock Vault
                    </button>
                </div>
            </div>
        )
    }

    // 3️⃣ No vault yet → Create
    if (!vaultExists) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow">
                    <h1 className="mb-4 text-xl font-semibold">
                        Create Vault
                    </h1>

                    <input
                        type="password"
                        placeholder="Master password"
                        className="mb-4 w-full rounded border px-3 py-2 text-sm"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        className="w-full rounded bg-black py-2 text-white"
                        onClick={async () => {
                            await window.envVault.createVault(password)
                            const exists = await window.envVault.exists()
                            setVaultExists(exists)
                        }}
                    >
                        Create Vault
                    </button>
                </div>
            </div>
        )
    }

    // 4️⃣ Vault exists but locked → Unlock
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow">
                <h1 className="mb-4 text-xl font-semibold">
                    Unlock Vault
                </h1>

                <input
                    type="password"
                    placeholder="Master password"
                    className="mb-4 w-full rounded border px-3 py-2 text-sm"
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <div className="mb-3 rounded bg-red-100 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <button
                    className="w-full rounded bg-black py-2 text-white"
                    onClick={async () => {
                        setError(null)
                        const result: any = await window.envVault.unlockVault(password)
                        if (!result?.ok) {
                            setError(result?.error)
                            return
                        }
                        setUnlocked(true)
                    }}

                >
                    Unlock Vault
                </button>

            </div>
        </div>
    )

}
