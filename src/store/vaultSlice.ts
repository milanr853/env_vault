import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type VaultState = {
    locked: boolean
    projects: Record<string, any> | null
}

const initialState: VaultState = {
    locked: true,
    projects: null
}

const vaultSlice = createSlice({
    name: "vault",
    initialState,
    reducers: {
        unlocked(state, action: PayloadAction<Record<string, any>>) {
            state.locked = false
            state.projects = action.payload
        },
        locked(state) {
            state.locked = true
            state.projects = null
        }
    }
})

export const { unlocked, locked } = vaultSlice.actions
export default vaultSlice.reducer
