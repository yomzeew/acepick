// registerSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RegisterDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  avatar?: string;
  lga?: string;
  state?: string;
  bvn?: string;
  address?: string;
}

interface RegisterState {
  userData: RegisterDetails;
}

const initialState: RegisterState = {
  userData: {},
};

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    setRegistrationData: (state, action: PayloadAction<Partial<RegisterDetails>>) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    clearRegistrationData: (state) => {
      state.userData = {};
    },
  },
});

export const { setRegistrationData, clearRegistrationData } = registerSlice.actions;
export default registerSlice.reducer;
