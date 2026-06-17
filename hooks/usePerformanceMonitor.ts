import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// Performance monitoring hook for tracking app performance
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());
  const lastRenderTime = useRef(Date.now());
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    const timeSinceMount = now - mountTime.current;

    // Log performance metrics in development
    if (__DEV__) {
      console.log(`🚀 Performance Monitor - ${componentName}:`, {
        renderCount: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender}ms`,
        timeSinceMount: `${timeSinceMount}ms`,
        memoryUsage: 'Not available in React Native',
      });

      // Warn about slow renders
      if (timeSinceLastRender > 100) {
        console.warn(`⚠️ Slow render detected in ${componentName}: ${timeSinceLastRender}ms`);
      }
    }

    lastRenderTime.current = now;

    // Cleanup on unmount
    return () => {
      const totalTime = Date.now() - mountTime.current;
      if (__DEV__) {
        console.log(`📊 Component ${componentName} unmounted after ${totalTime}ms (${renderCount.current} renders)`);
      }
    };
  });

  // Track app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (__DEV__) {
        console.log(`📱 App state changed in ${componentName}: ${appState.current} -> ${nextAppState}`);
      }
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        const now = Date.now();
        const timeInBackground = now - lastRenderTime.current;
        if (__DEV__) {
          console.log(`⏰ ${componentName}: App in background for ${timeInBackground}ms`);
        }
      }
      
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [componentName]);

  // Performance optimization utilities
  const memoizedCallback = useCallback((fn: Function, deps?: any[]) => {
    return useCallback(fn, deps || []);
  }, []);

  return {
    renderCount: renderCount.current,
    timeSinceMount: Date.now() - mountTime.current,
    memoizedCallback,
  };
};

// Memory usage monitoring (where available)
export const useMemoryMonitor = () => {
  const checkMemoryUsage = useCallback(() => {
    // React Native doesn't have direct memory API like web
    // This is a placeholder for potential native module integration
    if (__DEV__) {
      console.log('💾 Memory monitoring not directly available in React Native');
      console.log('Consider integrating with native memory monitoring modules');
    }
  }, []);

  useEffect(() => {
    // Check memory every 30 seconds in development
    if (__DEV__) {
      const interval = setInterval(checkMemoryUsage, 30000);
      return () => clearInterval(interval);
    }
  }, [checkMemoryUsage]);

  return { checkMemoryUsage };
};

// Network performance monitoring
export const useNetworkMonitor = () => {
  const lastRequestTime = useRef<number>(0);
  const requestCount = useRef(0);

  const trackRequest = useCallback((url: string, method: string) => {
    requestCount.current += 1;
    lastRequestTime.current = Date.now();

    if (__DEV__) {
      console.log(`🌐 Network Request #${requestCount.current}: ${method} ${url}`);
    }
  }, []);

  const trackResponse = useCallback((url: string, duration: number, success: boolean) => {
    if (__DEV__) {
      const status = success ? '✅' : '❌';
      console.log(`${status} Network Response: ${url} (${duration}ms)`);
      
      if (duration > 5000) {
        console.warn(`🐌 Slow network response: ${url} took ${duration}ms`);
      }
    }
  }, []);

  return {
    trackRequest,
    trackResponse,
    requestCount: requestCount.current,
  };
};

// Component performance profiler
export const useComponentProfiler = (componentName: string) => {
  const startTime = useRef(Date.now());
  const renderStartTime = useRef(Date.now());

  useEffect(() => {
    const renderEndTime = Date.now();
    const renderDuration = renderEndTime - renderStartTime.current;
    
    if (__DEV__) {
      console.log(`⏱️ ${componentName} render time: ${renderDuration}ms`);
      
      if (renderDuration > 16) {
        console.warn(`🐌 ${componentName} render missed 60fps target (${renderDuration}ms)`);
      }
    }
    
    renderStartTime.current = Date.now();
  });

  const totalComponentTime = Date.now() - startTime.current;

  return {
    renderTime: renderStartTime.current - startTime.current,
    totalTime: totalComponentTime,
  };
};
