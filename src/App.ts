import express from 'express';
import cors from 'cors';

export class App {
  public app: express.Express;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }
  
  private routes(): void {
    this.app.get('/', (_req, res) => res.json({ ok: true }));
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
