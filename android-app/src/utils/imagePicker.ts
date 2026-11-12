import * as ImagePicker from 'expo-image-picker';

export interface PickGalleryImageOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

export interface PickGalleryImageResult {
  canceled: boolean;
  permissionDenied?: boolean;
  dataUri?: string;
}

async function uriToDataUri(uri: string, fallbackMime = 'image/jpeg'): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result.startsWith('data:')) {
        resolve(result);
      } else {
        reject(new Error('Invalid encoded image data'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read selected image'));
    reader.readAsDataURL(blob.type ? blob : new Blob([blob], { type: fallbackMime }));
  });
}

/**
 * Picks an image from the Android/iOS photo library with automatic fallbacks
 * for Expo SDK 52 CompressionImageExporter and OEM Photo Picker quirks.
 */
export async function pickImageFromGallery(
  options: PickGalleryImageOptions = {}
): Promise<PickGalleryImageResult> {
  const { allowsEditing = false, aspect, quality = 0.6 } = options;

  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted && permissionResult.accessPrivileges !== 'limited') {
      return { canceled: true, permissionDenied: true };
    }
  } catch {
    // On Android 13+, PickVisualMedia/GET_CONTENT can still launch without runtime permission
  }

  const attempts: Array<ImagePicker.ImagePickerOptions & { legacy?: boolean }> = [
    {
      mediaTypes: ['images'],
      allowsEditing,
      ...(allowsEditing && aspect ? { aspect } : {}),
      quality,
      base64: true,
    },
    {
      // quality: 1 uses RawImageExporter instead of CompressionImageExporter
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      base64: true,
    },
    {
      // legacy: true uses ACTION_GET_CONTENT when OEM PickVisualMedia fails
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      base64: true,
      legacy: true,
    },
  ];

  let lastError: unknown = null;

  for (const attemptOptions of attempts) {
    try {
      const result = await ImagePicker.launchImageLibraryAsync(attemptOptions);
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { canceled: true };
      }

      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';

      if (asset.base64) {
        return {
          canceled: false,
          dataUri: `data:${mimeType};base64,${asset.base64}`,
        };
      }

      if (asset.uri) {
        const dataUri = asset.uri.startsWith('data:')
          ? asset.uri
          : await uriToDataUri(asset.uri, mimeType);
        return {
          canceled: false,
          dataUri,
        };
      }

      return { canceled: true };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Unable to open photo library on this device.');
}
