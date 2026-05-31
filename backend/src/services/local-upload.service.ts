import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

const ensureDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

export const saveFileLocally = (
  buffer: Buffer,
  originalFilename: string,
): { publicId: string; secureUrl: string } => {
  ensureDir();

  const ext = path.extname(originalFilename) || '.bin';
  const hash = crypto.randomBytes(16).toString('hex');
  const filename = `${hash}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(filePath, buffer);

  const publicId = `local/${hash}`;
  const secureUrl = `/uploads/${filename}`;

  return { publicId, secureUrl };
};

export const deleteLocalFile = (publicId: string): void => {
  const filename = publicId.replace('local/', '');
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
