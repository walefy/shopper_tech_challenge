import type { Request, Response } from 'express';
import { MeasureService } from '../service/MeasureService';

export class MeasureController {
  private service: MeasureService;

  constructor(service: MeasureService) {
    this.service = service;
  }

  public async upload(req: Request, res: Response): Promise<Response> {
    const {
      image,
      customer_code: customerCode,
      measure_datetime: measureDatetime,
      measure_type: measureType,
    } = req.body;

    const response = await this.service.upload({
      image,
      customerCode,
      measureDatetime: new Date(measureDatetime),
      measureType
    });

    return res.status(response.status).json(response.payload);
  }
}
