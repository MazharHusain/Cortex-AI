import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        loading: true,  // true initially - wait for auth check
    },
    reducers: {
        setUserdata: (state, action) => {
            state.userData = action.payload
            state.loading = false
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        }
    }
})

export const { setUserdata, setLoading } = userSlice.actions
export default userSlice.reducer
