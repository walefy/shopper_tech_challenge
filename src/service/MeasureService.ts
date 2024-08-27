import { HttpStatus } from '../enums/HttpStatus';
import { GeminiService } from './GeminiService';
import type { MeasureBodyUpload } from '../types/MeasureBodyUpload';
import type { ServiceResponse } from '../types/ServiceResponse';
import { MeterModel } from '../model/MeterModel';

export class MeasureService {
  private geminiService: GeminiService;
  private meterModel: MeterModel;

  constructor(geminiService = new GeminiService(), meterModel = new MeterModel()) {
    this.geminiService = geminiService;
    this.meterModel = meterModel;
  }

  public async upload(data: MeasureBodyUpload): Promise<ServiceResponse<string>> {
    const meteringValue = this.geminiService.interpretImage(data.image);

    const meter = await this.meterModel.create({
      customerId: data.customer_code,
      image: data.image,
      metering: meteringValue,
      meteringType: data.measure_type,
      timestamp: data.measure_datetime
    });

    return { status: HttpStatus.SUCCESS, payload: 'teste!' };
  }
}
