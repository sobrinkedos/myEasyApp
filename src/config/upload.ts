import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { ValidationError } from '@/utils/errors';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const logoDir = path.join(uploadDir, 'logos');

// Ensure upload directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

// Configure storage for general uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Configure storage for logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logoDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for images
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Tipo de arquivo inválido. Apenas JPEG e PNG são permitidos', {
      file: ['Tipo de arquivo inválido'],
    }));
  }
};

// Configure multer for general uploads
export const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
});

// Configure multer for logo uploads
export const logoUpload = multer({
  storage: logoStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Deletes a file from the filesystem
 * @param filePath - Path to the file to delete
 */
export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

/**
 * Gets the full path for a logo file
 * @param filename - Logo filename
 * @returns Full path to the logo file
 */
export function getLogoPath(filename: string): string {
  return path.join(logoDir, filename);
}

/**
 * Gets the URL path for a logo file
 * @param filename - Logo filename
 * @returns URL path to access the logo
 */
export function getLogoUrl(filename: string): string {
  return `/uploads/logos/${filename}`;
}
