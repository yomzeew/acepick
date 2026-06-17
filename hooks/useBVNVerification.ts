import { useQuery } from '@tanstack/react-query';
import { getBVNStatus } from 'services/bvnServices';
import { useDispatch } from 'react-redux';
import { updateUserFromDashboard } from 'redux/slices/authSlice';
import { useEffect } from 'react';

export const useBVNVerification = () => {
  const dispatch = useDispatch();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bvn-status'],
    queryFn: getBVNStatus,
    staleTime: 30 * 1000, // 30 seconds instead of 5 minutes
    retry: 2,
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when app comes to foreground
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  // Update Redux store when BVN status changes
  useEffect(() => {
    if (data?.verification) {
      dispatch(updateUserFromDashboard({
        profile: {
          bvn: data.verification.bvn,
          bvnVerified: data.verification.isVerified
        }
      }));
    }
  }, [data, dispatch]);

  return {
    isVerified: data?.isVerified || false,
    verification: data?.verification,
    isLoading,
    error,
    refetch
  };
};
