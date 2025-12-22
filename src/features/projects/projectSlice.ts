import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Project } from '../../../shared/models'

const initialState: Project[] = []

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        addProjects(state, action: PayloadAction<Project[]>) {
            state.push(...action.payload)
        }
    }
})

export const { addProjects } = projectSlice.actions
export default projectSlice.reducer
