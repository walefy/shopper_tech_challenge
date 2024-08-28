import { HttpStatus } from '../enums/HttpStatus';
import { GeminiService } from './GeminiService';
import { validateSchema } from '../utils/schemaValidator';
import { updateMeasureValueSchema } from '../schemas/updateMeasureValueSchema';
import { measureCreationSchema } from '../schemas/measureCreationSchema';
import { MeasureModel } from '../model/MeasureModel';
import { CustomerModel } from '../model/CustomerModel';
import { ErrorCode } from '../enums/ErrorCode';
import type { MeasureBodyUpload } from '../types/MeasureBodyUpload';
import type { ServiceResponse } from '../types/ServiceResponse';
import type { MeasureUploadSuccess } from '../types/MeasureUploadSuccess';
import type { ImageService } from './ImageService';
import type { UpdateMeasureValueBody } from '../types/UpdateMeasureValueBody';
import type { UpdateMeasureValueSuccess } from '../types/UpdateMeasureValueSuccess';
import { MeasureType } from '@prisma/client';
import type { CustomerWithMeasure } from '../types/CustomerWithMeasure';

export class MeasureService {
  private geminiService: GeminiService;
  private measureModel: MeasureModel;
  private customerModel: CustomerModel;
  private imageService: ImageService;

  constructor(
    imageService: ImageService,
    geminiService = new GeminiService(),
    measureModel = new MeasureModel(),
    customerModel = new CustomerModel(),
  ) {
    this.geminiService = geminiService;
    this.measureModel = measureModel;
    this.customerModel = customerModel;
    this.imageService = imageService;
  }

  public async upload(data: MeasureBodyUpload): Promise<ServiceResponse<MeasureUploadSuccess>> {
    const dataValidation = validateSchema(measureCreationSchema, data);

    if (!dataValidation.valid) {
      const payload = {
        errorCode: ErrorCode.INVALID_DATA,
        errorDescription: dataValidation.error || 'Invalid data',
      }; 

      return {
        status: HttpStatus.BAD_REQUEST,
        payload,
      };
    }

    const customer = await this.customerModel.findByIdOrCreate(data.customerCode);
    const measureInThisMonth = await this.measureModel.findByCustomerIdAndMonth(
      customer.customerCode,
      data.measureDatetime,
      data.measureType
    );

    if (measureInThisMonth) {
      const payload = {
        errorCode: ErrorCode.DOUBLE_REPORT,
        errorDescription: 'Leitura do mês já realizada',
      }; 

      return {
        status: HttpStatus.CONFLICT,
        payload,
      };
    }

    const measureValue = await this.geminiService.interpretImage(data.image);

    if (!measureValue.ok) {
      return {
        status: HttpStatus.INTERNAL,
        payload: { errorCode: ErrorCode.GEMINI_ERROR, errorDescription: measureValue.payload.errorDescription },
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

    const measure = await this.measureModel.create({
      customerCode: data.customerCode,
      measureValue: measureValue.payload.value,
      measureType: data.measureType,
      imageUrl: putImageResponse.payload.url,
      measureDatetime: data.measureDatetime
    });

    return {
      status: HttpStatus.SUCCESS,
      payload: {
        imageUrl: putImageResponse.payload.url,
        measureUuid: measure.measureUuid,
        measureValue: measure.measureValue
      }
    };
  }

  public async updateMeasureValue(data: UpdateMeasureValueBody): Promise<ServiceResponse<UpdateMeasureValueSuccess>> {
    const dataValidation = validateSchema(updateMeasureValueSchema, data);

    if (!dataValidation.valid) {
      const payload = {
        errorCode: ErrorCode.INVALID_DATA,
        errorDescription: dataValidation.error || 'Invalid data',
      }; 

      return {
        status: HttpStatus.BAD_REQUEST,
        payload,
      };
    }

    const measure = await this.measureModel.findById(data.measureUuid);

    if (!measure) {
      const payload = {
        errorCode: ErrorCode.MEASURE_NOT_FOUND,
        errorDescription: 'Leitura não encontrada',
      };

      return { status: HttpStatus.NOT_FOUND, payload };
    }

    if (measure.hasConfirmed) {
      const payload = {
        errorCode: ErrorCode.CONFIRMATION_DUPLICATE,
        errorDescription: 'Leitura já confirmada',
      };

      return { status: HttpStatus.CONFLICT, payload };
    }

    await this.measureModel.updateMeasureValue(data.measureUuid, data.confirmedValue);

    return { status: HttpStatus.SUCCESS, payload: { success: true } };
  }

  public async findByCustomerCode(customerCode: string, measureType: MeasureType): Promise<ServiceResponse<CustomerWithMeasure>> {
    if (measureType && !['water', 'gas'].includes(measureType.toLocaleLowerCase())) {
      const payload = {
        errorCode: ErrorCode.INVALID_TYPE,
        errorDescription: 'Tipo de medição não permitida',
      };

      return { status: HttpStatus.BAD_REQUEST, payload };
    }

    const measureTypeUpper = measureType !== undefined ? measureType.toUpperCase() : measureType;
    const measures = await this.measureModel.findByCustomerCode(customerCode, measureTypeUpper);

    return { status: HttpStatus.SUCCESS, payload: { customerCode: customerCode, measures } }
  }
}
