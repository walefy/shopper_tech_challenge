import { App } from './App';
import { BucketConfig } from './config/BucketConfig';

const PORT = process.env.APP_PORT || 3001;

const bucketConfig = new BucketConfig();
await bucketConfig.config();

const app = new App(bucketConfig);
export const appExpress = app.app;

app.start(PORT);
