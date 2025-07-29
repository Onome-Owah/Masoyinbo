import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') ?? '';
    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not defined in environment variables');
    }
    this.region = this.configService.get<string>('AWS_REGION') ?? '';
    if (!this.region) {
      throw new Error('AWS_REGION is not defined in environment variables');
    }

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    if (!accessKeyId) {
      throw new Error('AWS_ACCESS_KEY_ID is not defined in environment variables');
    }
    if (!secretAccessKey) {
      throw new Error('AWS_SECRET_ACCESS_KEY is not defined in environment variables');
    }
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadToS3(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file) return '';

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' as ObjectCannedACL,
    };

    try {
      await this.s3.send(new PutObjectCommand(params));
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
    } catch (error) {
      throw new InternalServerErrorException(
        `S3 Upload Failed: ${error.message}`,
      );
    }
  }
}
