import { useState, useCallback } from 'react';

interface UseImageLoaderReturn {
  loading: boolean;
  error: boolean;
  handleLoad: () => void;
  handleError: () => void;
  resetState: () => void;
}

export const useImageLoader = (): UseImageLoaderReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const resetState = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  return {
    loading,
    error,
    handleLoad,
    handleError,
    resetState,
  };
};
