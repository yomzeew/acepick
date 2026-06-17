import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Device ID service for unique device identification
 * Helps with multi-device call management and cleanup
 */
class DeviceIdService {
  private static DEVICE_ID_KEY = 'acepick_device_id';
  private static deviceId: string | null = null;

  /**
   * Get or generate a unique device ID
   */
  static async getDeviceId(): Promise<string> {
    if (this.deviceId) {
      return this.deviceId;
    }

    try {
      // Try to get existing device ID from storage
      const storedId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      
      if (storedId) {
        this.deviceId = storedId;
        console.log('📱 Using existing device ID:', this.deviceId);
        return this.deviceId;
      }

      // Generate new device ID
      const newId = await this.generateDeviceId();
      await AsyncStorage.setItem(this.DEVICE_ID_KEY, newId);
      this.deviceId = newId;
      
      console.log('📱 Generated new device ID:', this.deviceId);
      return this.deviceId;
    } catch (error) {
      console.error('❌ Error getting device ID:', error);
      // Fallback to timestamp-based ID
      const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.deviceId = fallbackId;
      return fallbackId;
    }
  }

  /**
   * Generate a unique device ID using platform info and random data
   */
  private static async generateDeviceId(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const platform = Platform.OS;
    
    // Create platform-specific identifier
    let platformSpecific = '';
    
    try {
      if (platform === 'ios') {
        // On iOS, we can use some device-specific info
        const scheme = Constants.expoConfig?.scheme;
        const name = Constants.expoConfig?.name;
        platformSpecific = (Array.isArray(scheme) ? scheme[0] : scheme) || 
                           (Array.isArray(name) ? name[0] : name) || 
                           'ios-app';
      } else if (platform === 'android') {
        // On Android, we can use package name
        const scheme = Constants.expoConfig?.scheme;
        const name = Constants.expoConfig?.name;
        platformSpecific = (Array.isArray(scheme) ? scheme[0] : scheme) || 
                           (Array.isArray(name) ? name[0] : name) || 
                           'android-app';
      }
    } catch (error) {
      console.warn('Could not get platform-specific info:', error);
      platformSpecific = `${platform}-app`;
    }

    // Combine all parts to create unique ID
    const deviceId = `${platformSpecific}-${timestamp}-${random}`;
    
    // Ensure it's not too long for storage/transport
    return deviceId.substr(0, 64);
  }

  /**
   * Reset device ID (for testing or troubleshooting)
   */
  static async resetDeviceId(): Promise<string> {
    try {
      await AsyncStorage.removeItem(this.DEVICE_ID_KEY);
      this.deviceId = null;
      const newId = await this.getDeviceId();
      console.log('📱 Device ID reset to:', newId);
      return newId;
    } catch (error) {
      console.error('❌ Error resetting device ID:', error);
      throw error;
    }
  }

  /**
   * Check if device ID exists
   */
  static async hasDeviceId(): Promise<boolean> {
    try {
      const id = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      return !!id;
    } catch (error) {
      console.error('❌ Error checking device ID:', error);
      return false;
    }
  }

  /**
   * Get device ID synchronously (returns cached value or null)
   */
  static getCachedDeviceId(): string | null {
    return this.deviceId;
  }

  /**
   * Clear cached device ID (forces fresh fetch next time)
   */
  static clearCache(): void {
    this.deviceId = null;
  }
}

export default DeviceIdService;
