import AWS, { BucketAlreadyOwnedByYou } from '@aws-sdk/client-s3';

export class BucketConfig {
  private _s3: AWS.S3;

  constructor() {
    const {
      BUCKET_ADDRESS,
      BUCKET_ACCESS_KEY_ID,
      BUCKET_SECRET_ACCESS_KEY
    } = process.env;

    if (!BUCKET_ADDRESS || !BUCKET_ACCESS_KEY_ID || !BUCKET_SECRET_ACCESS_KEY) {
      throw new Error('Bucket env vars not found!');
    }

    this._s3 = new AWS.S3({
      endpoint: BUCKET_ADDRESS,
      forcePathStyle: true,
      region: 'sa-east-1',
      credentials: {
        accessKeyId: BUCKET_ACCESS_KEY_ID,
        secretAccessKey: BUCKET_SECRET_ACCESS_KEY
      },
    });
  }
  
  public async config(bucketName = 'images') {
    try {
      await this._s3.createBucket({ Bucket: bucketName });

      const bucketPolicy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: "s3:GetObject",
            Resource: `arn:aws:s3:::${bucketName}/*`
          }
        ]
      };

      await this._s3.putBucketPolicy({
        Bucket: bucketName,
        Policy: JSON.stringify(bucketPolicy),
      });
    } catch (e) {
      if (e instanceof BucketAlreadyOwnedByYou) {
        console.warn('[WARN] bucket already exists');
      }
    }
  }

  public get s3() {
    return this._s3;
  }
}
