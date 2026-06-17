import axios from 'axios';
import { API_BASE_URL } from 'utilizes/endpoints';
import * as ImagePicker from 'expo-image-picker';

/**
 * Upload avatar to local backend storage
 * @param uri - Local image URI from ImagePicker
 * @returns Promise<string> - Public URL of uploaded avatar
 */
export const uploadAvatarToLocal = async (uri: string): Promise<string> => {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Append the file
    formData.append('avatar', {
      uri,
      type: 'image/jpeg', // Default type, backend will handle actual type
      name: `avatar_${Date.now()}.jpg`,
    } as any);

    // Get auth token from Redux store
    const state = require('redux/store').store.getState();
    const token = state.auth.token;

    // Upload to backend
    const response = await axios.post(
      `${API_BASE_URL}/auth/upload_avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.data?.data?.url) {
      return response.data.data.url;
    } else {
      throw new Error('Upload failed: No URL returned');
    }
  } catch (error: any) {
    console.error('Local avatar upload error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Avatar upload failed');
  }
};

/**
 * Upload product images to local backend storage
 * @param uris - Array of local image URIs
 * @returns Promise<string[]> - Array of public URLs
 */
export const uploadProductImagesToLocal = async (uris: string[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    
    // Append multiple files
    uris.forEach((uri, index) => {
      formData.append('product', {
        uri,
        type: 'image/jpeg',
        name: `product_${Date.now()}_${index}.jpg`,
      } as any);
    });

    // Get auth token
    const state = require('redux/store').store.getState();
    const token = state.auth.token;

    // Upload to backend
    const response = await axios.post(
      `${API_BASE_URL}/products/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.data?.data?.urls) {
      return response.data.data.urls;
    } else {
      throw new Error('Upload failed: No URLs returned');
    }
  } catch (error: any) {
    console.error('Local product images upload error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Product images upload failed');
  }
};

/**
 * Legacy wrapper for backward compatibility
 * Accepts FormData like the old uploadPhotoUser function
 */
export const uploadPhotoUserLocal = async (
  data: FormData | string,
): Promise<{ data: { url: string } }> => {
  let uri: string;

  if (typeof data === 'string') {
    uri = data;
  } else {
    // Extract URI from FormData
    const parts = (data as any)._parts as Array<[string, any]> | undefined;
    const filePart = parts?.find(
      ([key]) => key === 'avatar' || key === 'file',
    );
    if (!filePart || !filePart[1]?.uri) {
      throw new Error('No file found in FormData');
    }
    uri = filePart[1].uri;
  }

  const url = await uploadAvatarToLocal(uri);
  return { data: { url } };
};

/**
 * Upload chat file (image or audio) to local backend storage
 * @param uri - Local file URI from ImagePicker or Audio recording
 * @returns Promise<string> - Public URL of uploaded file
 */
export const uploadChatFileToLocal = async (uri: string): Promise<string> => {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Get file extension to determine MIME type
    const uriParts = uri.split('.');
    const fileExt = uriParts[uriParts.length - 1].toLowerCase();
    
    // Map extensions to MIME types
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      m4a: 'audio/mp4',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac',
    };
    
    const mimeType = mimeMap[fileExt] || 'application/octet-stream';
    
    // Append the file
    formData.append('chat', {
      uri,
      type: mimeType,
      name: `chat_${Date.now()}.${fileExt}`,
    } as any);

    // Get auth token from Redux store
    const state = require('redux/store').store.getState();
    const token = state.auth.token;

    // Upload to backend
    const response = await axios.post(
      `${API_BASE_URL}/chat/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.data?.data?.url) {
      return response.data.data.url;
    } else {
      throw new Error('Upload failed: No URL returned');
    }
  } catch (error: any) {
    console.error('Chat file upload error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Chat file upload failed');
  }
};

/**
 * Upload portfolio images to local backend storage
 * @param uris - Array of local image URIs
 * @param userId - Professional's user ID for subfolder
 * @returns Promise<string[]> - Array of public URLs
 */
export const uploadPortfolioImagesToLocal = async (
  uris: string[],
  userId?: string | number,
): Promise<string[]> => {
  try {
    const formData = new FormData();
    
    // Append multiple files
    uris.forEach((uri, index) => {
      formData.append('portfolio', {
        uri,
        type: 'image/jpeg',
        name: `portfolio_${Date.now()}_${index}.jpg`,
      } as any);
    });

    // Get auth token
    const state = require('redux/store').store.getState();
    const token = state.auth.token;

    // Upload to backend
    const response = await axios.post(
      `${API_BASE_URL}/portfolios/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.data?.data?.urls) {
      return response.data.data.urls;
    } else {
      throw new Error('Upload failed: No URLs returned');
    }
  } catch (error: any) {
    console.error('Portfolio images upload error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Portfolio images upload failed');
  }
};

/**
 * Upload a call recording audio file to local backend storage
 * @param uri - Local file URI from expo-av Recording
 * @param callerId - Caller's user ID for subfolder organization
 * @returns Promise<{ url: string, path: string }> - Public URL and file path
 */
export const uploadCallRecordingToLocal = async (
  uri: string,
  callerId?: string,
): Promise<{ url: string; path: string }> => {
  try {
    const formData = new FormData();
    
    // Get file extension
    const uriParts = uri.split('.');
    const fileExt = uriParts[uriParts.length - 1].toLowerCase();
    
    // Map extensions to MIME types
    const mimeMap: Record<string, string> = {
      m4a: 'audio/mp4',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac',
    };
    
    const mimeType = mimeMap[fileExt] || 'application/octet-stream';
    
    // Append the file
    formData.append('recording', {
      uri,
      type: mimeType,
      name: `recording_${Date.now()}.${fileExt}`,
    } as any);

    // Get auth token
    const state = require('redux/store').store.getState();
    const token = state.auth.token;

    // Upload to backend
    const response = await axios.post(
      `${API_BASE_URL}/call-recordings/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.data?.data?.url) {
      return {
        url: response.data.data.url,
        path: response.data.data.url.split('/').pop() || '',
      };
    } else {
      throw new Error('Upload failed: No URL returned');
    }
  } catch (error: any) {
    console.error('Call recording upload error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Call recording upload failed');
  }
};
