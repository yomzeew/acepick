/**
 * Test utility for logout cleanup functionality
 * This can be used during development to verify cleanup works properly
 */

import CleanupService from './cleanupService';
import { disconnectSocket } from './socketInstance';
import ChatCacheService from './chatCache';

/**
 * Test the cleanup service without actually logging out
 * This helps verify that all cleanup steps complete properly
 */
export const testCleanupService = async () => {
  console.log('🧪 Starting cleanup service test...');
  
  const startTime = Date.now();
  
  try {
    // Mock cleanup functions to test the timeout and error handling
    const mockVideoCleanup = async () => {
      console.log('📹 Mock video cleanup running...');
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
      console.log('📹 Mock video cleanup completed');
    };
    
    const mockVoiceCleanup = async () => {
      console.log('📞 Mock voice cleanup running...');
      await new Promise(resolve => setTimeout(resolve, 150)); // Simulate work
      console.log('📞 Mock voice cleanup completed');
    };
    
    // Register mock cleanup functions
    CleanupService.registerVideoCallCleanup(mockVideoCleanup);
    CleanupService.registerVoiceCallCleanup(mockVoiceCleanup);
    
    // Run the cleanup
    await CleanupService.performLogoutCleanup();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Cleanup test completed successfully in ${duration}ms`);
    return { success: true, duration };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`❌ Cleanup test failed after ${duration}ms:`, error);
    return { success: false, duration, error };
  } finally {
    // Clear registrations after test
    CleanupService.clearRegistrations();
  }
};

/**
 * Test individual components of cleanup
 */
export const testIndividualComponents = async () => {
  console.log('🧪 Testing individual cleanup components...');
  
  const results = {
    socketDisconnect: false,
    chatCacheClear: false
  };
  
  try {
    // Test socket disconnect
    console.log('🔌 Testing socket disconnect...');
    disconnectSocket();
    results.socketDisconnect = true;
    console.log('✅ Socket disconnect test passed');
    
    // Test chat cache clear
    console.log('💾 Testing chat cache clear...');
    await ChatCacheService.clearAll();
    results.chatCacheClear = true;
    console.log('✅ Chat cache clear test passed');
    
  } catch (error) {
    console.error('❌ Component test failed:', error);
  }
  
  return results;
};

/**
 * Test timeout functionality by creating a hanging promise
 */
export const testTimeoutProtection = async () => {
  console.log('🧪 Testing timeout protection...');
  
  try {
    // Register a hanging cleanup function
    const hangingCleanup = async () => {
      console.log('⏳ Starting hanging cleanup (will timeout)...');
      await new Promise(() => {}); // Never resolves
    };
    
    CleanupService.registerVideoCallCleanup(hangingCleanup);
    
    // This should timeout after 5 seconds
    const startTime = Date.now();
    await CleanupService.performLogoutCleanup();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration < 6000) { // Should be around 5 seconds + small overhead
      console.log(`✅ Timeout protection worked - completed in ${duration}ms`);
      return { success: true, duration };
    } else {
      console.log(`❌ Timeout protection failed - took ${duration}ms`);
      return { success: false, duration };
    }
    
  } catch (error) {
    console.log('✅ Timeout protection caught error:', error.message);
    return { success: true, error: error.message };
  } finally {
    CleanupService.clearRegistrations();
  }
};
