import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserDetails {
  firstname: string;
  lastname: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserDetails | null;
  activePage:string
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  activePage:'Home'
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserDetails>) => {
      state.isAuthenticated = true;
      state.user = action.payload; // Set user details from the payload
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null; // Clear user details on logout
    },
    setActivePage:(state,action:PayloadAction<string>)=>{
      state.activePage=action.payload
    }

  },
});

export const { login, logout,setActivePage } = authSlice.actions;
export default authSlice.reducer;
