import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { supabase, BUCKET, FOLDERS } from 'config/supabase';
import { decode } from 'base64-arraybuffer';

// ─── Types ───────────────────────────────────────────────────
export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadOptions {
  /** Supabase storage bucket name */
  bucket: string;
  /** Optional subfolder inside the bucket, e.g. 'user_123' */
  folder?: string;
  /** Override the auto-generated filename */
  fileName?: string;
}

// ─── Helpers ─────────────────────────────────────────────────

/** Extract file extension from a URI */
const getFileExt = (uri: string): string => {
  const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase();
  return ext || 'jpg';
};

/** Map extension to MIME type */
const getMimeType = (ext: string): string => {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    m4a: 'audio/mp4',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
  };
  return map[ext] || 'application/octet-stream';
};

/** Generate a unique file path */
const generateFilePath = (opts: UploadOptions, ext: string): string => {
  const name = opts.fileName || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const fullName = name.includes('.') ? name : `${name}.${ext}`;
  return opts.folder ? `${opts.folder}/${fullName}` : fullName;
};

// ─── Core upload (reads file → base64 → ArrayBuffer → Supabase) ─────

/**
 * Upload a single file from a local URI to Supabase Storage.
 * Works on both iOS and Android.
 */
export const uploadFile = async (
  uri: string,
  options: UploadOptions,
): Promise<UploadResult> => {
  // Normalize URI for Android
  let normalizedUri = uri;
  if (Platform.OS === 'android' && !normalizedUri.startsWith('file://')) {
    normalizedUri = `file://${normalizedUri}`;
  }

  const ext = getFileExt(normalizedUri);
  const mimeType = getMimeType(ext);
  const filePath = generateFilePath(options, ext);

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(normalizedUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Convert base64 to ArrayBuffer
  const arrayBuffer = decode(base64);

  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from(options.bucket)
    .upload(filePath, arrayBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(options.bucket)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
};

// ─── Convenience wrappers ────────────────────────────────────

/**
 * Upload an avatar image. Returns the public URL.
 * @param uri - Local image URI from ImagePicker
 * @param userId - Used as subfolder for organization
 */
export const uploadAvatar = async (uri: string, userId?: string | number): Promise<string> => {
  const result = await uploadFile(uri, {
    bucket: BUCKET,
    folder: userId ? `${FOLDERS.AVATARS}/${userId}` : FOLDERS.AVATARS,
    fileName: `avatar_${Date.now()}`,
  });
  return result.url;
};

/**
 * Upload multiple product images. Returns array of public URLs.
 * @param uris - Array of local image URIs
 * @param productRef - Optional product identifier for subfolder
 */
export const uploadProductImages = async (
  uris: string[],
  productRef?: string,
): Promise<string[]> => {
  const results = await Promise.all(
    uris.map((uri, index) =>
      uploadFile(uri, {
        bucket: BUCKET,
        folder: productRef ? `${FOLDERS.PRODUCTS}/${productRef}` : FOLDERS.PRODUCTS,
        fileName: `product_${Date.now()}_${index}`,
      }),
    ),
  );
  return results.map((r) => r.url);
};

/**
 * Upload multiple portfolio images. Returns array of public URLs.
 * @param uris - Array of local image URIs
 * @param userId - Professional's user ID for subfolder
 */
export const uploadPortfolioImages = async (
  uris: string[],
  userId?: string | number,
): Promise<string[]> => {
  const results = await Promise.all(
    uris.map((uri, index) =>
      uploadFile(uri, {
        bucket: BUCKET,
        folder: userId ? `${FOLDERS.PORTFOLIOS}/${userId}` : FOLDERS.PORTFOLIOS,
        fileName: `portfolio_${Date.now()}_${index}`,
      }),
    ),
  );
  return results.map((r) => r.url);
};

/**
 * Upload a generic file. Returns the public URL.
 */
export const uploadGenericFile = async (uri: string, folder?: string): Promise<string> => {
  const result = await uploadFile(uri, {
    bucket: BUCKET,
    folder: folder ? `${FOLDERS.GENERAL}/${folder}` : FOLDERS.GENERAL,
  });
  return result.url;
};

/**
 * Upload a call recording audio file. Returns { url, path }.
 * @param uri - Local file URI from expo-av Recording
 * @param callerId - Caller's user ID for subfolder organization
 */
export const uploadCallRecording = async (
  uri: string,
  callerId?: string,
): Promise<UploadResult> => {
  return uploadFile(uri, {
    bucket: BUCKET,
    folder: callerId ? `${FOLDERS.RECORDINGS}/${callerId}` : FOLDERS.RECORDINGS,
    fileName: `recording_${Date.now()}`,
  });
};

/**
 * Delete a file from Supabase storage by its path.
 */
export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
};
