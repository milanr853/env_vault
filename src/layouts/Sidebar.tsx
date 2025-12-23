import { useDispatch, useSelector } from 'react-redux'
import { FiFolder } from 'react-icons/fi'
import { setActiveProject } from '../features/projects/projectSlice'

export function Sidebar() {
    const dispatch = useDispatch()

    const { projects, activeProject } = useSelector(
        (state: any) => state.projects
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
                    const isActive = path === activeProject

                    return (
                        <li
                            key={path}
                            onClick={() => dispatch(setActiveProject(path))}
                            title={path}
                            className={`
                flex items-center gap-2
                px-2 py-1 rounded
                text-sm cursor-pointer
                transition
                ${isActive
                                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
              `}
                        >
                            <FiFolder
                                className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-blue-500'
                                    }`}
                            />
                            <span className="truncate">{name}</span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
