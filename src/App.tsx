import { useEffect, useState } from "react"
import { FiPlus, FiCopy, FiTrash2, FiLock } from "react-icons/fi"

/* ───────────────── Types ───────────────── */

type Screen = "CHECKING" | "CREATE" | "UNLOCK" | "DASHBOARD"

type ImportState = {
    name: string
    path: string
    envData: Record<string, string>
} | null

/* ───────────────── App ───────────────── */

export default function App() {
    const [screen, setScreen] = useState<Screen>("CHECKING")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)

    const [projects, setProjects] = useState<Record<string, Record<string, string>>>({})
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)

    const [importState, setImportState] = useState<ImportState>(null)

    const [runCommand, setRunCommand] = useState("")
    const [runError, setRunError] = useState<string | null>(null)

    // ✅ STEP A — per-project run state
    const [runningProjects, setRunningProjects] = useState<Record<string, boolean>>({})

    /* ───────── Initial vault check ───────── */

    useEffect(() => {
        ; (async () => {
            const exists = await window.envVault.exists()
            setScreen(exists ? "UNLOCK" : "CREATE")
        })()
    }, [])

    /* ───────── CREATE ───────── */

    if (screen === "CREATE") {
        return (
            <CenterCard title="Create Vault">
                <input
                    type="password"
                    placeholder="Master password"
                    className="input"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className="btn-primary"
                    onClick={async () => {
                        await window.envVault.createVault(password)
                        setPassword("")
                        setScreen("UNLOCK")
                    }}
                >
                    Create Vault
                </button>
            </CenterCard>
        )
    }

    /* ───────── UNLOCK ───────── */

    if (screen === "UNLOCK") {
        return (
            <CenterCard title="Unlock Vault">
                <input
                    type="password"
                    placeholder="Master password"
                    className="input"
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    className="btn-primary flex items-center justify-center gap-2"
                    onClick={async () => {
                        setError(null)
                        const res: any = await window.envVault.unlockVault(password)
                        if (!res?.ok) {
                            setError(res?.error)
                            return
                        }
                        setProjects(res.projects)
                        setPassword("")
                        setScreen("DASHBOARD")
                    }}
                >
                    <FiLock /> Unlock
                </button>
            </CenterCard>
        )
    }

    /* ───────── DASHBOARD ───────── */

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-600">Projects</h2>

                    <button
                        className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        onClick={async () => {
                            const pick = await window.envVault.pickProject()
                            if (!pick.ok) return

                            const scan = await window.envVault.scanProject(pick.path)
                            if (!scan.ok || scan.files.length === 0) {
                                alert("No .env file found in this folder")
                                return
                            }

                            const read = await window.envVault.readEnvFile(
                                pick.path,
                                scan.files[0]
                            )
                            if (!read.ok) {
                                alert(read.error)
                                return
                            }

                            setImportState({
                                name: pick.path.split("/").pop()!,
                                path: pick.path,
                                envData: read.data
                            })
                        }}
                    >
                        <FiPlus />
                    </button>
                </div>

                <ul className="space-y-1">
                    {Object.keys(projects).map((name) => (
                        <li key={name}>
                            <button
                                className={`w-full rounded px-3 py-2 text-left text-sm ${selectedProject === name
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                                onClick={() => setSelectedProject(name)}
                            >
                                {name}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main */}
            <main className="flex-1 p-6">
                {!selectedProject && (
                    <p className="text-gray-400">Select a project to view secrets</p>
                )}

                {selectedProject && (() => {
                    const isRunning = !!runningProjects[selectedProject]

                    return (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h1 className="text-lg font-semibold">{selectedProject}</h1>

                                <button
                                    className="text-red-600 hover:text-red-700"
                                    onClick={async () => {
                                        const ok = confirm(`Delete project "${selectedProject}"?`)
                                        if (!ok) return

                                        await window.envVault.deleteProject(selectedProject)

                                        setRunningProjects((p) => {
                                            const copy = { ...p }
                                            delete copy[selectedProject]
                                            return copy
                                        })

                                        const copy = { ...projects }
                                        delete copy[selectedProject]
                                        setProjects(copy)
                                        setSelectedProject(null)
                                    }}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>

                            {/* ───── Run Project ───── */}
                            <div className="mb-4 rounded-lg border bg-gray-50 p-4">
                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                    Run command
                                </label>

                                <input
                                    type="text"
                                    placeholder="npm run dev"
                                    value={runCommand}
                                    onChange={(e) => setRunCommand(e.target.value)}
                                    className="mb-3 w-full rounded border px-3 py-2 text-sm"
                                />

                                {runError && (
                                    <div className="mb-2 text-xs text-red-600">
                                        {runError}
                                    </div>
                                )}

                                {!isRunning ? (
                                    <button
                                        className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                                        onClick={async () => {
                                            setRunError(null)

                                            if (!runCommand.trim()) {
                                                setRunError("Command required")
                                                return
                                            }

                                            const res: any =
                                                await window.envVault.runProject(
                                                    selectedProject,
                                                    runCommand
                                                )

                                            if (!res?.ok) {
                                                setRunError(res?.error)
                                                return
                                            }

                                            setRunningProjects((p) => ({
                                                ...p,
                                                [selectedProject]: true
                                            }))
                                        }}
                                    >
                                        ▶ Run
                                    </button>
                                ) : (
                                    <button
                                        className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                                        onClick={async () => {
                                            await window.envVault.stopProject(selectedProject)

                                            setRunningProjects((p) => ({
                                                ...p,
                                                [selectedProject]: false
                                            }))
                                        }}
                                    >
                                        ■ Stop
                                    </button>
                                )}
                            </div>

                            <ul className="space-y-2">
                                {Object.entries(projects[selectedProject]).map(
                                    ([key, value]) => (
                                        <li
                                            key={key}
                                            className="flex items-center justify-between rounded border bg-white px-3 py-2"
                                        >
                                            <span className="font-mono text-sm">{key}</span>

                                            <button
                                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black"
                                                onClick={async () => {
                                                    await window.envVault.copyToClipboard(value)
                                                    setCopiedKey(key)
                                                    setTimeout(
                                                        () => setCopiedKey(null),
                                                        1200
                                                    )
                                                }}
                                            >
                                                <FiCopy />
                                                {copiedKey === key ? "Copied" : "Copy"}
                                            </button>
                                        </li>
                                    )
                                )}
                            </ul>
                        </>
                    )
                })()}
            </main>

            {/* Import Modal */}
            {importState && (
                <Modal>
                    <h3 className="mb-2 text-lg font-semibold">
                        Import project "{importState.name}"?
                    </h3>

                    <p className="mb-4 text-sm text-gray-600">
                        {Object.keys(importState.envData).length} variables detected
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            className="btn-secondary"
                            onClick={() => setImportState(null)}
                        >
                            Cancel
                        </button>

                        <button
                            className="btn-primary"
                            onClick={async () => {
                                const res = await window.envVault.saveProjectEnv(
                                    importState.name,
                                    importState.envData
                                )
                                if (!res.ok) {
                                    alert(res.error)
                                    return
                                }

                                setProjects((p) => ({
                                    ...p,
                                    [importState.name]: importState.envData
                                }))

                                setImportState(null)
                            }}
                        >
                            Import
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

/* ───────── UI Helpers ───────── */

function CenterCard({ title, children }: any) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-96 rounded-lg bg-white p-6 shadow">
                <h1 className="mb-4 text-lg font-semibold">{title}</h1>
                <div className="space-y-3">{children}</div>
            </div>
        </div>
    )
}

function Modal({ children }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-96 rounded-lg bg-white p-6 shadow">{children}</div>
        </div>
    )
}
