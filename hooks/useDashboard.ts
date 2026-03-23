import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { useMutation } from "@tanstack/react-query";
import {
  getClientDashboard,
  getProfessionalDashboard,
  getDeliveryDashboard,
} from "services/dashboardService";
import {
  setDashboardLoading,
  setDashboardError,
  setClientDashboard,
  setProfessionalDashboard,
  setDeliveryDashboard,
} from "redux/slices/dashboardSlice";
import { updateUserFromDashboard } from "redux/slices/authSlice";

/**
 * Hook that fetches and provides dashboard data based on the current user's role.
 * Automatically dispatches to the correct Redux slice AND syncs
 * fresh profile / wallet data back into auth.user so every existing
 * `useSelector(state => state.auth.user)` call stays up-to-date.
 *
 * Usage:
 *   const { data, loading, error, refresh } = useDashboard();
 */
export const useDashboard = () => {
  const dispatch = useDispatch();
  const role = useSelector((state: RootState) => state.auth?.user?.role);
  const dashboardState = useSelector((state: RootState) => state.dashboard);

  const syncToAuth = (data: any) => {
    dispatch(updateUserFromDashboard({
      profile: data?.profile,
      wallet: data?.wallet,
      professional: data?.professional,
    }));
  };

  const clientMutation = useMutation({
    mutationFn: getClientDashboard,
    onSuccess: (res) => {
      dispatch(setClientDashboard(res.data));
      syncToAuth(res.data);
    },
    onError: (err: any) => dispatch(setDashboardError(err?.message || "Failed to load dashboard")),
  });

  const professionalMutation = useMutation({
    mutationFn: getProfessionalDashboard,
    onSuccess: (res) => {
      dispatch(setProfessionalDashboard(res.data));
      syncToAuth(res.data);
    },
    onError: (err: any) => dispatch(setDashboardError(err?.message || "Failed to load dashboard")),
  });

  const deliveryMutation = useMutation({
    mutationFn: getDeliveryDashboard,
    onSuccess: (res) => {
      dispatch(setDeliveryDashboard(res.data));
      syncToAuth(res.data);
    },
    onError: (err: any) => dispatch(setDashboardError(err?.message || "Failed to load dashboard")),
  });

  const fetchDashboard = useCallback(() => {
    dispatch(setDashboardLoading(true));
    switch (role) {
      case "client":
        clientMutation.mutate();
        break;
      case "professional":
        professionalMutation.mutate();
        break;
      case "delivery":
        deliveryMutation.mutate();
        break;
      default:
        dispatch(setDashboardError(`Unknown role: ${role}`));
    }
  }, [role]);

  useEffect(() => {
    if (role) fetchDashboard();
  }, [role]);

  const currentData =
    role === "client"
      ? dashboardState.client
      : role === "professional"
      ? dashboardState.professional
      : role === "delivery"
      ? dashboardState.delivery
      : null;

  return {
    role,
    data: currentData,
    loading: dashboardState.loading,
    error: dashboardState.error,
    lastFetched: dashboardState.lastFetched,
    refresh: fetchDashboard,
  };
};
