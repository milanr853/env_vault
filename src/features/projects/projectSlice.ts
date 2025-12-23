import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ProjectState = {
    projects: string[]
    activeProject: string | null
}

const initialState: ProjectState = {
    projects: [],
    activeProject: null,
}

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        addProjects(state, action: PayloadAction<string[]>) {
            for (const path of action.payload) {
                if (!state.projects.includes(path)) {
                    state.projects.push(path)
                }
            }

            // auto-select first project if none selected
            if (!state.activeProject && state.projects.length > 0) {
                state.activeProject = state.projects[0]
            }
        },

        setActiveProject(state, action: PayloadAction<string | null>) {
            state.activeProject = action.payload
        },
    },
})

export const { addProjects, setActiveProject } = projectSlice.actions
export default projectSlice.reducer
