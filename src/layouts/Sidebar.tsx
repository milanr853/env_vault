import { useSelector } from 'react-redux'

export function Sidebar() {
    const projects = useSelector(
        (state: any) => state.projects.projects
    )

    return (
        <div className="w-64 border-r p-2 h-full">
            <h3 className="text-sm font-semibold mb-2">
                Imported Projects
            </h3>

            {projects.length === 0 && (
                <div className="text-xs text-gray-400">
                    No projects imported
                </div>
            )}

            <ul className="space-y-1">
                {projects.map((path: string) => (
                    <li
                        key={path}
                        className="text-xs truncate px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                        title={path}
                    >
                        {path.split('/').pop()}
                    </li>
                ))}
            </ul>
        </div>
    )
}
