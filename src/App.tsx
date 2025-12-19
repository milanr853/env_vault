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
    const [pendingProjectPath, setPendingProjectPath] = useState<string | null>(null)
    const [pendingEnvFiles, setPendingEnvFiles] = useState<string[] | null>(null)
    const [pendingEnvData, setPendingEnvData] = useState<Record<string, string> | null>(null)
    const [pendingProjectName, setPendingProjectName] = useState<string | null>(null)
    const [isImporting, setIsImporting] = useState(false)



    useEffect(() => {
        async function checkVault() {
            const exists = await window?.envVault?.exists()
            setVaultExists(exists)
            setChecking(false)
        }

        checkVault()
    }, [])

    useEffect(() => {
        if (!pendingProjectPath) return

            ; (async () => {
                const res = await window.envVault.scanProject(pendingProjectPath)
                if (!res.ok || res.files.length === 0) {
                    alert("No .env files found in selected directory")
                    setIsImporting(false)
                    setPendingProjectPath(null)
                    setPendingProjectName(null)
                    setPendingEnvFiles(null)
                    setPendingEnvData(null)
                    return
                }

                setPendingEnvFiles(res.files)
            })()
    }, [pendingProjectPath])

    const projectNames = Object.keys(projects)

    const sidebarProjects = pendingProjectName &&
        !projectNames.includes(pendingProjectName)
        ? [...projectNames, pendingProjectName]
        : projectNames





    // 1️⃣ Still checking vault existence
    if (checking) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-500">
                Checking vault…
            </div>
        )
    }

    if (unlocked && !isImporting) {
        return (
            <div className="flex h-screen">
                {/* Left: Projects */}
                <div className="w-64 border-r bg-gray-50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-600">
                            Projects
                        </h2>

                        <button
                            onClick={async () => {
                                const res = await window.envVault.pickProject()
                                if (!res.ok) return

                                setPendingProjectPath(res.path)
                                setPendingProjectName(res.path.split("/").pop()!)
                                setIsImporting(true)

                            }}
                            className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                            + Add
                        </button>
                    </div>


                    {projectNames.length === 0 && (
                        <p className="text-sm text-gray-400">
                            No projects yet
                        </p>
                    )}

                    <ul className="space-y-1">
                        {sidebarProjects.map((name) => {
                            const isPending = pendingProjectName !== null &&
                                name === pendingProjectName &&
                                !(name in projects)

                            return (
                                <button
                                    key={name}
                                    disabled={isPending}
                                    className={`mb-2 w-full rounded px-3 py-2 text-left text-sm ${isPending
                                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                        : selectedProject === name
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-100"
                                        }`}
                                    onClick={() => {
                                        if (isPending) return
                                        setSelectedProject(name)
                                    }}
                                >
                                    {name}
                                    {isPending && (
                                        <span className="ml-2 text-xs italic">
                                            (pending)
                                        </span>
                                    )}
                                </button>
                            )
                        })}

                    </ul>
                </div>

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
        <>
            {/* 🟡 STEP A3 / A4 — Import Flow */}
            {isImporting && (
                <div className="flex h-screen items-center justify-center bg-gray-50">
                    {pendingEnvFiles && (
                        <>
                            <h3 className="mb-2 text-sm font-semibold">
                                Select env file
                            </h3>

                            {pendingEnvFiles.map((file) => (
                                <button
                                    key={file}
                                    className="mb-2 block w-full rounded border px-3 py-2 text-left hover:bg-gray-100"
                                    onClick={async () => {
                                        const res = await window.envVault.readEnvFile(
                                            pendingProjectPath!,
                                            file
                                        )

                                        if (!res.ok) {
                                            alert(res.error)
                                            return
                                        }

                                        setPendingEnvData(res.data)
                                        setPendingEnvFiles(null)
                                    }}
                                >
                                    {file}
                                </button>
                            ))}
                        </>
                    )}

                    {pendingEnvData && (
                        <>
                            <h3 className="mb-2 font-semibold">
                                Import project?
                            </h3>

                            <p className="mb-4 text-sm text-gray-600">
                                {Object.keys(pendingEnvData).length} variables detected
                            </p>

                            <button
                                className="rounded bg-green-600 px-4 py-2 text-white"
                                onClick={async () => {
                                    const projectName =
                                        pendingProjectPath!.split("/").pop()!

                                    const res =
                                        await window.envVault.saveProjectEnv(
                                            projectName,
                                            pendingEnvData
                                        )

                                    if (!res.ok) {
                                        alert(res.error)
                                        return
                                    }

                                    setProjects((p) => ({
                                        ...p,
                                        [projectName]: pendingEnvData
                                    }))

                                    setIsImporting(false)
                                    setPendingProjectPath(null)
                                    setPendingProjectName(null)
                                    setPendingEnvFiles(null)
                                    setPendingEnvData(null)
                                }}
                            >
                                Import Project
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* 🔒 Vault locked → Unlock UI */}
            {!pendingEnvFiles && !pendingEnvData && !unlocked && (
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
                                const result: any =
                                    await window.envVault.unlockVault(password)

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
            )}
        </>
    )
}
