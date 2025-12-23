import { useSelector } from 'react-redux'
import { FiFolder } from 'react-icons/fi'

export function Sidebar() {
    const projects = useSelector(
        (state: any) => state.projects.projects
    )

    return (
        <div className="w-64 border-r p-3 bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                Imported Projects
            </h3>

            {projects.length === 0 && (
                <div className="text-xs text-gray-400">
                    No projects imported
                </div>
            )}

            <ul className="space-y-1">
                {projects.map((path: string) => {
                    const name = path.split('/').pop()

                    return (
                        <li
                            key={path}
                            title={path}
                            className="
                flex items-center gap-2
                px-2 py-1 rounded
                text-sm text-gray-700
                hover:bg-gray-100
                cursor-default
              "
                        >
                            <FiFolder className="text-gray-500 shrink-0" />
                            <span className="truncate">{name}</span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
