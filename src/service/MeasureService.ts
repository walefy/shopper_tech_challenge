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
import type { ImageService } from './ImageService';

export class MeasureService {
  private geminiService: GeminiService;
  private meterModel: MeterModel;
  private customerModel: CustomerModel;
  private imageService: ImageService;

  constructor(
    imageService: ImageService,
    geminiService = new GeminiService(),
    meterModel = new MeterModel(),
    customerModel = new CustomerModel(),
  ) {
    this.geminiService = geminiService;
    this.meterModel = meterModel;
    this.customerModel = customerModel;
    this.imageService = imageService;
  }

  public async upload(data: MeasureBodyUpload): Promise<ServiceResponse<MeasureUploadSuccess>> {
    const dataValidation = validateSchema(measureCreationSchema, data);

    if (!dataValidation.valid) {
      const payload = {
        errorCode: ErrorCode.INVALID_DATA,
        errorDescription: dataValidation.error || 'Invalid data'
      }; 

      return {
        status: HttpStatus.BAD_REQUEST,
        payload,
      };
    }

    const customer = await this.customerModel.findByIdOrCreate(data.customerCode);
    const meterInThisMonth = await this.meterModel.findByCustomerIdAndMonth(
      customer.id,
      data.measureDatetime,
      data.measureType
    );

    if (meterInThisMonth) {
      const payload = {
        errorCode: ErrorCode.DOUBLE_REPORT,
        errorDescription: 'Leitura do mês já realizada'
      }; 

      return {
        status: HttpStatus.CONFLICT,
        payload,
      };
    }

    const meteringValue = await this.geminiService.interpretImage(data.image);

    if (!meteringValue.ok) {
      return {
        status: HttpStatus.INTERNAL,
        payload: { errorCode: ErrorCode.GEMINI_ERROR, errorDescription: meteringValue.payload.errorDescription },
      };
    }

    const putImageResponse = await this.imageService.putImage(data.image);

    if (!putImageResponse.ok) {
      return {
        status: HttpStatus.INTERNAL,
        payload: {
          errorCode: ErrorCode.UPLOAD_IMAGE_ERROR,
          errorDescription: putImageResponse.payload.errorDescription
        },
      };
    }

    const meter = await this.meterModel.create({
      customerId: data.customerCode,
      metering: meteringValue.payload.value,
      meteringType: data.measureType,
      imageUrl: putImageResponse.payload.url,
      timestamp: data.measureDatetime
    });

    return {
      status: HttpStatus.SUCCESS,
      payload: {
        imageUrl: putImageResponse.payload.url,
        measureUuid: meter.id,
        measureValue: meter.metering
      }
    };
  }
}
