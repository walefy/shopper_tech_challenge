import { HttpStatus } from '../enums/HttpStatus';
import { GeminiService } from './GeminiService';
import { validateSchema } from '../utils/schemaValidator';
import { measureCreationSchema } from '../schemas/measureCreationSchema';
import { MeterModel } from '../model/MeterModel';
import { CustomerModel } from '../model/CustomerModel';
import { ErrorCode } from '../enums/ErrorCode';
import type { MeasureBodyUpload } from '../types/MeasureBodyUpload';
import type { ServiceResponse } from '../types/ServiceResponse';
import type { MeasureUploadSuccess } from '../types/MeasureUploadSuccess';

export class MeasureService {
  private geminiService: GeminiService;
  private meterModel: MeterModel;
  private customerModel: CustomerModel;

  constructor(
    geminiService = new GeminiService(),
    meterModel = new MeterModel(),
    customerModel = new CustomerModel(),
  ) {
    this.geminiService = geminiService;
    this.meterModel = meterModel;
    this.customerModel = customerModel;
  }

  public async upload(data: MeasureBodyUpload): Promise<ServiceResponse<MeasureUploadSuccess>> {
    const dataValidation = validateSchema(measureCreationSchema, data);

    if (!dataValidation.valid) {
      const payload = {
        error_code: ErrorCode.INVALID_DATA,
        error_description: dataValidation.error || 'Invalid data'
      }; 

      return {
        status: HttpStatus.BAD_REQUEST,
        payload,
      };
    }

    const customer = await this.customerModel.findByIdOrCreate(data.customer_code);
    const meterInThisMonth = await this.meterModel.findByCustomerIdAndMonth(
      customer.id,
      data.measure_datetime,
      data.measure_type
    );

    if (meterInThisMonth) {
      const payload = {
        error_code: ErrorCode.DOUBLE_REPORT,
        error_description: 'Leitura do mês já realizada'
      }; 

      return {
        status: HttpStatus.CONFLICT,
        payload,
      };
    }

    const meteringValue = await this.geminiService.interpretImage(data.image);

    const meter = await this.meterModel.create({
      customerId: data.customer_code,
      image: data.image,
      metering: meteringValue,
      meteringType: data.measure_type,
      timestamp: data.measure_datetime
    });

    return {
      status: HttpStatus.SUCCESS,
      payload: {
        imageUrl: 'not implemented',
        measureUuid: meter.id,
        measureValue: meter.metering
      }
    };
  }
}
