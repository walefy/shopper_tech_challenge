import { S3 } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import type { PutImageResponse } from '../types/PutImageResponse';

export class ImageService {
  private s3: S3;
  private BUCKET_ADDRESS = process.env.EXTERN_BUCKET_ADDRESS;

  constructor(s3: S3) {
    this.s3 = s3;
  }

  public async putImage(imageSource: string): Promise<PutImageResponse> {
    const imageBuf = Buffer.from(imageSource, 'base64');
   
    const imageKey = `${uuidv4()}.jpg`;
    const params = {
      Bucket: 'images',
      Key: imageKey,
      Body: imageBuf,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
    };

    try {
      await this.s3.putObject(params);
      const url = `${this.BUCKET_ADDRESS}/images/${imageKey}`;
      return { ok: true, payload: { url } }
    } catch (e) {
      console.log(e);
      return { ok: false, payload: { errorDescription: 'image cant be uploaded!' } }
    }
  }
}
