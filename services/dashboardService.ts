import axios from "axios";
import { store } from "redux/store";
import { API_BASE_URL, DASHBOARD } from "utilizes/endpoints";

const getAuthHeader = () => {
  const token = store.getState().auth?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

/**
 * Fetch aggregated dashboard data for the client role.
 * Returns: profile, wallet, jobSummary, recentJobs, recentTransactions, recentOrders
 */
export const getClientDashboard = async () => {
  const response = await axios.get(
    `${API_BASE_URL}${DASHBOARD.CLIENT}`,
    getAuthHeader()
  );
  return response.data;
};

/**
 * Fetch aggregated dashboard data for the professional role.
 * Returns: profile, wallet, professional, jobSummary, recentJobs, recentTransactions, ratings, recentReviews
 */
export const getProfessionalDashboard = async () => {
  const response = await axios.get(
    `${API_BASE_URL}${DASHBOARD.PROFESSIONAL}`,
    getAuthHeader()
  );
  return response.data;
};

/**
 * Fetch aggregated dashboard data for the delivery role.
 * Returns: profile, wallet, rider, orderSummary, activeOrders, recentOrders, recentTransactions, ratings
 */
export const getDeliveryDashboard = async () => {
  const response = await axios.get(
    `${API_BASE_URL}${DASHBOARD.DELIVERY}`,
    getAuthHeader()
  );
  return response.data;
};

/**
 * Role-aware helper: fetches the correct dashboard based on the user's role.
 */
export const getDashboardByRole = async (role?: string) => {
  switch (role) {
    case "client":
      return getClientDashboard();
    case "professional":
      return getProfessionalDashboard();
    case "delivery":
      return getDeliveryDashboard();
    default:
      throw new Error(`Unknown role: ${role}`);
  }
};
