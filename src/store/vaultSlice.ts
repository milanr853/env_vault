import { createSlice, PayloadAction } from '@reduxjs/toolkit'


type VaultState = { locked: boolean; projects: Record<string, any> | null }
const slice = createSlice({
    name: 'vault', initialState: { locked: true, projects: null } as VaultState, reducers: {
        unlocked(state, action: PayloadAction<Record<string, any>>) { state.locked = false; state.projects = action.payload },
        locked(state) { state.locked = true; state.projects = null }
    }
})
export const { unlocked, locked } = slice.actions
export default slice.reducer