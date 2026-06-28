import { Asset } from 'react-native-image-picker';

const CLOUD_NAME = 'dqwejigww';
const UPLOAD_PRESET = 'deepdetech';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Uploads an image to Cloudinary using an unsigned upload preset.
 * No API Secret is used — safe for client-side React Native usage.
 *
 * @param image - Asset object from react-native-image-picker
 * @returns Cloudinary upload result
 */
export const uploadImageToCloudinary = async (
  image: Asset,
): Promise<CloudinaryUploadResult> => {
  try {
    const formData = new FormData();

    formData.append('file', {
      uri: image.uri,
      type: image.type ?? 'image/jpeg',
      name: image.fileName ?? 'image.jpg',
    } as any);

    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Cloudinary upload failed (${response.status}): ${errorBody}`,
      );
    }

    const data = await response.json();

    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
    };
  } catch (error: any) {
    console.error('[Cloudinary] Upload error:', error);
    throw new Error(error.message ?? 'Image upload to Cloudinary failed.');
  }
};
