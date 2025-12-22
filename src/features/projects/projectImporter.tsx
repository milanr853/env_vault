import { useDispatch } from 'react-redux'
import { addProjects } from './projectSlice'

export default function ProjectImporter() {
    const dispatch = useDispatch()

    const importFolders = async () => {
        const paths = await window?.api.selectFolders()
        dispatch(
            addProjects(
                paths.map((p: string) => ({
                    id: crypto.randomUUID(),
                    path: p,
                    name: p.split('/').pop()!
                }))
            )
        )
    }

    return (
        <button
            onClick={importFolders}
            className="px-4 py-2 bg-blue-600 text-white rounded"
        >
            Import Projects
        </button>
    )
}
