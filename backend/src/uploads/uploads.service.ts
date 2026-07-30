import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private uploadDir: string;

  constructor(private config: ConfigService) {
    this.uploadDir = join(process.cwd(), 'uploads');
    const cloudName = config.get('CLOUDINARY_CLOUD_NAME');
    if (cloudName && cloudName !== 'placeholder') {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: config.get('CLOUDINARY_API_KEY'),
        api_secret: config.get('CLOUDINARY_API_SECRET'),
      });
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
    if (cloudName && cloudName !== 'placeholder') {
      try {
        return await this.uploadToCloudinary(file);
      } catch {
        // Fall through to local upload
      }
    }
    return this.uploadLocal(file);
  }

  private async uploadToCloudinary(file: Express.Multer.File, folder = 'nutrizaria'): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 800, crop: 'limit' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else
              resolve({
                url: result!.secure_url,
                publicId: result!.public_id,
              });
          },
        )
        .end(file.buffer);
    });
  }

  private async uploadLocal(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    await mkdir(this.uploadDir, { recursive: true });
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(this.uploadDir, filename);
    await writeFile(filepath, file.buffer);
    const port = this.config.get('PORT', '4000');
    const url = `http://localhost:${port}/uploads/${filename}`;
    return { url, publicId: filename };
  }

  async deleteImage(publicId: string) {
    const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
    if (cloudName && cloudName !== 'placeholder') {
      try {
        return await cloudinary.uploader.destroy(publicId);
      } catch {
        // ignore
      }
    }
  }
}
