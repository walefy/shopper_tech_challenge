import express from 'express';
import cors from 'cors';
import { mainRoute } from './routes/mainRoute';
import type { BucketConfig } from './config/BucketConfig';

export class App {
  public app: express.Express;
  private bucketConfig: BucketConfig;

  constructor(bucketConfig: BucketConfig) {
    this.app = express();
    this.bucketConfig = bucketConfig;
    this.config();
    this.routes();
  }
  
  private routes(): void {
    this.app.get('/', (_req, res) => res.json({ ok: true }));
    this.app.use(mainRoute(this.bucketConfig.s3));
  }
  
  private config(): void {
    const accessControl: express.RequestHandler = (_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT,PATCH');
      res.header('Access-Control-Allow-Headers', '*');
      next();
    };

    this.app.use(express.json());
    this.app.use(accessControl);
    this.app.use(cors());
  }

  public start(port: string | number): void {
    this.app.listen(port, () => console.log(`📡 Running on port ${port}`));
  }
}
