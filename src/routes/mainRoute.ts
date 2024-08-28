import { Router } from 'express';
import { MeasureController } from '../controller/MeasureController';
import { MeasureService } from '../service/MeasureService';
import { ImageService } from '../service/ImageService';
import { S3 } from '@aws-sdk/client-s3';

export const mainRoute = (s3: S3) => {
  const router = Router();
  const imageService = new ImageService(s3);
  const measureService = new MeasureService(imageService);
  const measureController = new MeasureController(measureService);
  
  router.post('/upload', (req, res) => measureController.upload(req, res));
  router.patch('/confirm', (req, res) => measureController.updateMeasureValue(req, res));
  router.get('/:customerCode/list', (req, res) => measureController.findByCustomerCode(req, res));

  return router;
};