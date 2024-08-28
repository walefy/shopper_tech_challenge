import type { Request, Response } from 'express';
import { MeasureService } from '../service/MeasureService';
import { camelToSnake } from '../utils/camelToSnake';
import type { MeasureType } from '@prisma/client';

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

    return res.status(response.status).json(camelToSnake(response.payload));
  }

  public async updateMeasureValue(req: Request, res: Response): Promise<Response> {
    const {
      measure_uuid: measureUuid,
      confirmed_value: confirmedValue
    } = req.body;

    const response = await this.service.updateMeasureValue({ measureUuid, confirmedValue });

    return res.status(response.status).json(camelToSnake(response.payload));
  }

  public async findByCustomerCode(req: Request, res: Response): Promise<Response> {
    const { customerCode } = req.params;
    const { measure_type: measureType } = req.query;

    const response = await this.service.findByCustomerCode(customerCode, measureType as MeasureType);

    return res.status(response.status).json(camelToSnake(response.payload))
  }
}
