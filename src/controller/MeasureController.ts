import type { Request, Response } from 'express';
import { MeasureService } from '../service/MeasureService';

export class MeasureController {
  private service: MeasureService;

  constructor(service = new MeasureService) {
    this.service = service;
  }

  public async upload(req: Request, res: Response): Promise<Response> {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    const response = await this.service.upload({
      image,
      customer_code,
      measure_datetime: new Date(measure_datetime),
      measure_type
    });

    return res.status(response.status).json(response.payload);
  }
}
