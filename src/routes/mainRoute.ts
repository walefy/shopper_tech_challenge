import { Router } from 'express';
import { MeasureController } from '../controller/MeasureController';

export const mainRoute = Router();
const measureController = new MeasureController();

mainRoute.post('/upload', (req, res) => measureController.upload(req, res));
