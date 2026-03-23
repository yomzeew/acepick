import { uploadAvatar } from './supabaseStorage';

/**
 * Upload a user photo (avatar) to Supabase Storage.
 *
 * For backward compatibility this still accepts FormData,
 * but callers should prefer importing `uploadAvatar` directly
 * from `services/supabaseStorage` and passing just the URI.
 *
 * @param data - Either a FormData (legacy) or a plain URI string
 * @returns {{ data: { url: string } }}
 */
export const uploadPhotoUser = async (
  data: FormData | string,
): Promise<{ data: { url: string } }> => {
  let uri: string;

  if (typeof data === 'string') {
    uri = data;
  } else {
    // Extract URI from the FormData's first appended file part.
    // React Native FormData stores parts in _parts array.
    const parts = (data as any)._parts as Array<[string, any]> | undefined;
    const filePart = parts?.find(
      ([key]) => key === 'avatar' || key === 'file',
    );
    if (!filePart || !filePart[1]?.uri) {
      throw new Error('No file found in FormData');
    }
    uri = filePart[1].uri;
  }

  const url = await uploadAvatar(uri);
  return { data: { url } };
};