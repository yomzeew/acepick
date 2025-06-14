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
  professionId?:number;
  position?:string
}

interface RegisterState {
  userData: RegisterDetails;
  cooperationData: CooperationDetails | null;
}

interface DirectorDetails {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    state?: string;
    lga?: string;
    bvn?: string;
  }
  
  interface CooperationDetails {
    avatar?: string;
    nameOfOrg?: string;
    phone?: string;
    address?: string;
    state?: string;
    lga?: string;
    regNum?: string;
    noOfEmployees?: number;
    director?: DirectorDetails;
    professionId?:number
  }
  

const initialState: RegisterState = {
  userData: {},
  cooperationData: null,
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
    setCooperationData: (state, action: PayloadAction<CooperationDetails>) => {
        state.cooperationData = action.payload;
      },
      updateDirectorData: (state, action: PayloadAction<Partial<DirectorDetails>>) => {
        if (state.cooperationData) {
          state.cooperationData.director = {
            ...state.cooperationData.director,
            ...action.payload,
          };
        }
      },
      clearCooperationData: (state) => {
        state.cooperationData = null;
      },
  },
});

export const { setRegistrationData, clearRegistrationData,setCooperationData,clearCooperationData } = registerSlice.actions;
export default registerSlice.reducer;
