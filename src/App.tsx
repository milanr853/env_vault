import { useEffect, useState } from "react"

export default function App() {
    const [checking, setChecking] = useState(true)
    const [vaultExists, setVaultExists] = useState<boolean | null>(null)
    const [password, setPassword] = useState("")
    const [unlocked, setUnlocked] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [projects, setProjects] = useState<Record<string, Record<string, string>>>({})
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)



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
    // if (unlocked) {
    //     return (
    //         <div className="flex h-screen items-center justify-center">
    //             <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow">
    //                 <h1 className="mb-4 text-xl font-semibold text-green-600">
    //                     Vault Unlocked
    //                 </h1>

    //                 <p className="mb-6 text-sm text-gray-600">
    //                     Your secrets are decrypted in memory.
    //                 </p>

    //                 <button
    //                     className="w-full rounded bg-red-600 py-2 text-white"
    //                     onClick={async () => {
    //                         await window.envVault.lockVault()
    //                         setUnlocked(false)
    //                         setProjects({})
    //                         setSelectedProject(null)
    //                     }}
    //                 >
    //                     Lock Vault
    //                 </button>
    //             </div>
    //         </div>
    //     )
    // }
    if (unlocked) {
        const projectNames = Object.keys(projects)
        return (
            <div className="flex h-screen">
                {/* Left: Projects */}
                <div className="w-64 border-r bg-gray-50 p-4">
                    <h2 className="mb-3 text-sm font-semibold text-gray-600">
                        Projects
                    </h2>

                    {projectNames.length === 0 && (
                        <p className="text-sm text-gray-400">
                            No projects yet
                        </p>
                    )}

                    <ul className="space-y-1">
                        {projectNames.map((name) => (
                            <li key={name}>
                                <button
                                    onClick={() => setSelectedProject(name)}
                                    className={`w-full rounded px-3 py-2 text-left text-sm ${selectedProject === name
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-200"
                                        }`}
                                >
                                    {name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right: Placeholder */}
                {/* <div className="flex-1 p-6">
                    <p className="text-gray-400">
                        Select a project to view secrets
                    </p>
                </div> */}
                <div className="flex-1 p-6">
                    {!selectedProject && (
                        <p className="text-gray-400">
                            Select a project to view secrets
                        </p>
                    )}

                    {selectedProject && (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {selectedProject}
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Working directory: <span className="italic">not selected</span>
                                    </p>
                                </div>


                                <button
                                    onClick={async () => {
                                        const ok = confirm(
                                            `Delete project "${selectedProject}"?`
                                        )
                                        if (!ok) return

                                        const res =
                                            await window.envVault.deleteProject(
                                                selectedProject
                                            )

                                        if (res.ok) {
                                            const updated = { ...projects }
                                            delete updated[selectedProject]
                                            setProjects(updated)
                                            setSelectedProject(null)
                                        } else {
                                            alert(res.error)
                                        }
                                    }}
                                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>


                            <ul className="space-y-2">
                                {Object.keys(projects[selectedProject] || {}).map(
                                    (key) => (
                                        // <li
                                        //     key={key}
                                        //     className="flex items-center justify-between rounded border px-3 py-2"
                                        // >
                                        //     <span className="font-mono text-sm">
                                        //         {key}
                                        //     </span>

                                        //     {/* Value is intentionally hidden */}
                                        //     <span className="text-xs text-gray-400">
                                        //         ●●●●●●
                                        //     </span>
                                        // </li>
                                        <li
                                            key={key}
                                            className="flex items-center justify-between rounded border px-3 py-2"
                                        >
                                            <span className="font-mono text-sm">
                                                {key}
                                            </span>

                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-400">
                                                    ●●●●●●
                                                </span>

                                                <button
                                                    onClick={async () => {
                                                        await window.envVault.copyToClipboard(
                                                            projects[selectedProject][key]
                                                        )
                                                        setCopiedKey(key)
                                                        setTimeout(() => setCopiedKey(null), 1500)
                                                    }}
                                                    className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                                                >
                                                    {copiedKey === key ? "Copied ✓" : "Copy"}
                                                </button>
                                            </div>
                                        </li>
                                    )
                                )}
                            </ul>
                        </>
                    )}
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
                        setProjects(result.projects)
                        setSelectedProject(null)
                    }}

                >
                    Unlock Vault
                </button>

            </div>
        </div>
    )

}
