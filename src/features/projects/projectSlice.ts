import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ProjectState = {
    projects: string[]
}

const initialState: ProjectState = {
    projects: [],
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
        },
    },
})

export const { addProjects } = projectSlice.actions
export default projectSlice.reducer
