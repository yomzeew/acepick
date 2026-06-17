import { disconnectSocket, getDeviceId } from './socketInstance';
import ChatCacheService from './chatCache';
import DeviceIdService from './deviceIdService';

/**
 * Centralized cleanup service for logout
 * Handles socket disconnection, call cleanup, and cache clearing
 * Now with device ID support for multi-device scenarios
 */
class CleanupService {
  private static videoCallCleanup: (() => Promise<void>) | null = null;
  private static voiceCallCleanup: (() => Promise<void>) | null = null;
  private static currentDeviceId: string | null = null;

  /**
   * Register video call cleanup function
   */
  static registerVideoCallCleanup(cleanup: () => Promise<void>) {
    this.videoCallCleanup = cleanup;
  }

  /**
   * Register voice call cleanup function
   */
  static registerVoiceCallCleanup(cleanup: () => Promise<void>) {
    this.voiceCallCleanup = cleanup;
  }

  /**
   * Perform complete logout cleanup with device ID support
   * CRITICAL ORDER:
   * 1. End calls first (while socket is still connected to send end-call events)
   * 2. Then disconnect socket
   * 3. Finally clear cache
   */
  static async performLogoutCleanup() {
    console.log('🧹 Starting logout cleanup...');

    try {
      // Get current device ID
      const deviceId = await this.getCurrentDeviceId();
      console.log('📱 Device ID for cleanup:', deviceId);

      // 1. End all active calls FIRST (needs socket to notify other party)
      const callCleanupPromises = [];
      
      if (this.videoCallCleanup) {
        console.log('📹 Ending video call and notifying partner...');
        callCleanupPromises.push(this.timeoutWrapper(this.videoCallCleanup(), 'video call', 5000));
      }

      if (this.voiceCallCleanup) {
        console.log('📞 Ending voice call and notifying partner...');
        callCleanupPromises.push(this.timeoutWrapper(this.voiceCallCleanup(), 'voice call', 5000));
      }

      // Wait for all call cleanup to complete (including socket emissions)
      if (callCleanupPromises.length > 0) {
        await Promise.allSettled(callCleanupPromises);
        // Give a small delay to ensure socket events are sent
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // 2. NOW disconnect socket (after call end events are sent)
      console.log('🔌 Disconnecting socket...');
      disconnectSocket();

      // 3. Clear chat cache
      console.log('💾 Clearing chat cache...');
      await this.timeoutWrapper(ChatCacheService.clearAll(), 'chat cache', 3000);

      console.log('✅ Logout cleanup completed for device:', deviceId);
    } catch (error) {
      console.error('❌ Error during logout cleanup:', error);
      // Even if cleanup fails, still disconnect socket and clear cache
      try {
        disconnectSocket();
        await ChatCacheService.clearAll();
      } catch (e) {
        console.error('❌ Error in fallback cleanup:', e);
      }
    }
  }

  /**
   * Get current device ID
   */
  private static async getCurrentDeviceId(): Promise<string> {
    if (this.currentDeviceId) {
      return this.currentDeviceId;
    }

    try {
      this.currentDeviceId = await DeviceIdService.getDeviceId();
      return this.currentDeviceId;
    } catch (error) {
      console.error('❌ Error getting device ID:', error);
      // Fallback to socket device ID or generate temporary one
      const socketDeviceId = getDeviceId();
      return socketDeviceId || `unknown-${Date.now()}`;
    }
  }

  /**
   * Cleanup calls for specific device only
   */
  static async cleanupDeviceSpecificCalls(activeCallDeviceId?: string): Promise<void> {
    const currentDeviceId = await this.getCurrentDeviceId();
    
    // If no device ID provided, or it matches current device, proceed with cleanup
    if (!activeCallDeviceId || activeCallDeviceId === currentDeviceId) {
      console.log('🧹 Cleaning up calls for device:', currentDeviceId);
      
      const callCleanupPromises = [];
      
      if (this.videoCallCleanup) {
        callCleanupPromises.push(this.videoCallCleanup());
      }
      
      if (this.voiceCallCleanup) {
        callCleanupPromises.push(this.voiceCallCleanup());
      }
      
      if (callCleanupPromises.length > 0) {
        await Promise.allSettled(callCleanupPromises);
      }
    } else {
      console.log('⏭️ Skipping cleanup - call belongs to different device:', activeCallDeviceId);
    }
  }

  /**
   * Wrap async operations with timeout to prevent hanging
   */
  private static async timeoutWrapper<T>(
    promise: Promise<T>, 
    operation: string, 
    timeoutMs: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} cleanup timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Clear all registered cleanup functions
   */
  static clearRegistrations() {
    this.videoCallCleanup = null;
    this.voiceCallCleanup = null;
  }

  /**
   * Test cleanup functionality (for development)
   */
  static async testCleanup() {
    console.log('🧪 Testing cleanup service...');
    
    const mockVideoCleanup = async () => {
      console.log('📹 Mock video cleanup...');
      await new Promise(resolve => setTimeout(resolve, 100));
    };
    
    const mockVoiceCleanup = async () => {
      console.log('📞 Mock voice cleanup...');
      await new Promise(resolve => setTimeout(resolve, 100));
    };
    
    // Register test functions
    this.registerVideoCallCleanup(mockVideoCleanup);
    this.registerVoiceCallCleanup(mockVoiceCleanup);
    
    try {
      await this.performLogoutCleanup();
      console.log('✅ Cleanup test passed');
      return true;
    } catch (error) {
      console.error('❌ Cleanup test failed:', error);
      return false;
    } finally {
      this.clearRegistrations();
    }
  }
}

export default CleanupService;
