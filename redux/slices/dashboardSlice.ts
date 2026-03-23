import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ClientDashboardData,
  ProfessionalDashboardData,
  DeliveryDashboardData,
} from "types/dashboardTypes";

interface DashboardState {
  client: ClientDashboardData | null;
  professional: ProfessionalDashboardData | null;
  delivery: DeliveryDashboardData | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: DashboardState = {
  client: null,
  professional: null,
  delivery: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) state.error = null;
    },
    setDashboardError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setClientDashboard: (state, action: PayloadAction<ClientDashboardData>) => {
      state.client = action.payload;
      state.loading = false;
      state.error = null;
      state.lastFetched = new Date().toISOString();
    },
    setProfessionalDashboard: (state, action: PayloadAction<ProfessionalDashboardData>) => {
      state.professional = action.payload;
      state.loading = false;
      state.error = null;
      state.lastFetched = new Date().toISOString();
    },
    setDeliveryDashboard: (state, action: PayloadAction<DeliveryDashboardData>) => {
      state.delivery = action.payload;
      state.loading = false;
      state.error = null;
      state.lastFetched = new Date().toISOString();
    },
    clearDashboard: (state) => {
      state.client = null;
      state.professional = null;
      state.delivery = null;
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
});

export const {
  setDashboardLoading,
  setDashboardError,
  setClientDashboard,
  setProfessionalDashboard,
  setDeliveryDashboard,
  clearDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
