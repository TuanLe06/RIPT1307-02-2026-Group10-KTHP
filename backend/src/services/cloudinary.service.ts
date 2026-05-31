import cloudinary, { ensureCloudinaryConfigured } from '../config/cloudinary';
import { saveFileLocally, deleteLocalFile } from './local-upload.service';

const isCloudinaryDisabled = (): boolean =>
  process.env.CLOUDINARY_DISABLED === 'true';

export type UploadImageOptions = {
  folder?: string;
  publicId?: string;
};

export type UploadedImage = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resourceType: string;
};

export const uploadImageBuffer = async (
  buffer: Buffer,
  options: UploadImageOptions = {}
): Promise<UploadedImage> => {
  if (isCloudinaryDisabled()) {
    const { publicId, secureUrl } = saveFileLocally(buffer, 'image.jpg');
    return { publicId, secureUrl, width: 0, height: 0, format: 'jpg', bytes: buffer.length, resourceType: 'image' };
  }

  ensureCloudinaryConfigured();
  const folder = options.folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER ?? 'he-thong-tuyen-sinh';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder,
        public_id: options.publicId,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload failed: empty response'));
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          resourceType: result.resource_type,
        });
      }
    );

    stream.end(buffer);
  });
};

export const uploadDocumentBuffer = async (
  buffer: Buffer,
  originalFilename: string,
  options: UploadImageOptions = {}
): Promise<UploadedImage> => {
  if (isCloudinaryDisabled()) {
    const { publicId, secureUrl } = saveFileLocally(buffer, originalFilename);
    return { publicId, secureUrl, width: 0, height: 0, format: '', bytes: buffer.length, resourceType: 'raw' };
  }

  ensureCloudinaryConfigured();
  const folder = options.folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER ?? 'he-thong-tuyen-sinh';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder,
        public_id: options.publicId,
        filename_override: originalFilename,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload failed: empty response'));
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width ?? 0,
          height: result.height ?? 0,
          format: result.format ?? '',
          bytes: result.bytes,
          resourceType: result.resource_type,
        });
      }
    );

    stream.end(buffer);
  });
};

export const deleteAssetByPublicId = async (publicId: string): Promise<void> => {
  if (publicId.startsWith('local/')) {
    deleteLocalFile(publicId);
    return;
  }

  ensureCloudinaryConfigured();
  const resourceTypes: Array<'image' | 'raw' | 'video'> = ['image', 'raw', 'video'];
  let deleted = false;

  for (const resourceType of resourceTypes) {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (result.result === 'ok') {
      deleted = true;
      break;
    }
  }

  if (!deleted) {
    throw new Error(`Cloudinary delete failed for publicId=${publicId}`);
  }
};

export const deleteImageByPublicId = async (publicId: string): Promise<void> => {
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary delete failed for publicId=${publicId}`);
  }
};
