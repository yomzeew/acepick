// Debug script to check authentication status
import * as SecureStore from 'expo-secure-store';

export const debugAuth = async () => {
  console.log('🔍 Debugging Authentication Status...\n');
  
  try {
    // Check if token exists
    const token = await SecureStore.getItemAsync('userToken');
    console.log('Token exists:', !!token);
    
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20) + '...');
      
      // Try to decode JWT payload (without verification)
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            exp: new Date(payload.exp * 1000).toLocaleString(),
            iat: new Date(payload.iat * 1000).toLocaleString()
          });
          
          // Check if token is expired
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp < now) {
            console.log('⚠️ Token is EXPIRED!');
          } else {
            console.log('✅ Token is valid');
          }
        } catch (decodeError) {
          console.log('❌ Failed to decode token payload:', decodeError);
        }
      } else {
        console.log('❌ Token format is invalid (not a JWT)');
      }
    } else {
      console.log('❌ No token found - user needs to log in');
    }
    
    // Check user data
    const userData = await SecureStore.getItemAsync('userData');
    console.log('User data exists:', !!userData);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('User info:', {
          id: user.id,
          email: user.email,
          role: user.role
        });
      } catch (parseError) {
        console.log('❌ Failed to parse user data:', parseError);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

export const clearAuthData = async () => {
  console.log('🧹 Clearing authentication data...');
  try {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    console.log('✅ Auth data cleared');
  } catch (error) {
    console.error('❌ Failed to clear auth data:', error);
  }
};
