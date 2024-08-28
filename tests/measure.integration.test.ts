import { test, expect, describe, afterEach } from 'bun:test';
import request from 'supertest';
import sinon from 'sinon';
import { appExpress as app } from '../src/server';
import { GeminiService } from '../src/service/GeminiService';
import { ImageService } from '../src/service/ImageService';
import type { GeminiInterpretImageResponse } from '../src/types/GeminiInterpretImageResponse';
import type { PutImageResponse } from '../src/types/PutImageResponse';
import { restoreDb } from './scripts/restoreDb';
import type { MeasureType } from '@prisma/client';

describe('Integration test from Measure', () => {
  const sandbox = sinon.createSandbox();

  afterEach(async () => {
    sandbox.restore();
    await restoreDb();
  });

  const stubImageUpload = (payload: PutImageResponse) => {
    const putImageStub = sandbox.stub(ImageService.prototype, 'putImage');
    putImageStub.returns(new Promise((res, rej) => res(payload)));
  };

  const stubImageInterpret = (payload: GeminiInterpretImageResponse) => {
    const interpretImageStub = sandbox.stub(GeminiService.prototype, 'interpretImage');
    interpretImageStub.returns(new Promise((res, rej) => res(payload)));

  };

  const createMeasure = async (customerCode: string, measureType: MeasureType, datetime: Date) => {
    const data = {
      image: '',
      customer_code: customerCode,
      measure_type: measureType,
      measure_datetime: datetime
    };
    
    return await request(app)
    .post('/upload')
    .send(data)
    .set('Accept', 'application/json');
  };

  test('Test that /upload works correctly with the correct data', async () => {  
    stubImageInterpret({ ok: true, payload: { value: 25 } })
    stubImageUpload({ ok: true, payload: { url: 'http://test.com' } });

    const response = await createMeasure('2', 'GAS', new Date());
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('image_url');
    expect(response.body.image_url).toBe('http://test.com');
    expect(response.body).toHaveProperty('measure_uuid');
    expect(response.body.measure_uuid).toBeTypeOf('string');
    expect(response.body).toHaveProperty('measure_value');
    expect(response.body.measure_value).toBe(25);
  });

  test('Test if /upload returns conflict when send the same measure two times', async () => {
    stubImageInterpret({ ok: true, payload: { value: 25 } });
    stubImageUpload({ ok: true, payload: { url: 'http://test.com' } });

    const datetime = new Date();

    await createMeasure('2', 'WATER', datetime);
    const response = await createMeasure('2', 'WATER', datetime);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error_code');
    expect(response.body).toHaveProperty('error_description');
    expect(response.body.error_code).toBe('DOUBLE_REPORT');
    expect(response.body.error_description).toBe('Leitura do mês já realizada');
  });

  test('Test if /upload handle correctly the gemini error', async () => {
    stubImageInterpret({ ok: false, payload: { errorDescription: 'an error occurred in gemini, try again.' } });
    stubImageUpload({ ok: true, payload: { url: 'http://test.com' } });

    const response = await createMeasure('11223', 'GAS', new Date());

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error_code');
    expect(response.body).toHaveProperty('error_description');
    expect(response.body.error_code).toBe('GEMINI_ERROR');
    expect(response.body.error_description).toBe('an error occurred in gemini, try again.');
  });

  test('Test if /upload handle correctly the minio error', async () => {
    stubImageInterpret({ ok: true, payload: { value: 25 } });
    stubImageUpload({ ok: false, payload: { errorDescription: 'image cant be uploaded!' } });

    const response = await createMeasure('11223', 'GAS', new Date());

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error_code');
    expect(response.body).toHaveProperty('error_description');
    expect(response.body.error_code).toBe('UPLOAD_IMAGE_ERROR');
    expect(response.body.error_description).toBe('image cant be uploaded!');
  });

  test('Test if /confirm works correctly with the correct data', async () => {
    stubImageInterpret({ ok: true, payload: { value: 25 } })
    stubImageUpload({ ok: true, payload: { url: 'http://test.com' } });

    const postResponse = await createMeasure('2256', 'WATER', new Date());

    const confirmData = {
      measure_uuid: postResponse.body.measure_uuid,
      confirmed_value: 200
    };

    const response = await request(app)
      .patch('/confirm')
      .send(confirmData)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
  });

  test('Test if /confirm returns conflict when receive confirm to measure already confirmed', async () => {
    stubImageInterpret({ ok: true, payload: { value: 25 } })
    stubImageUpload({ ok: true, payload: { url: 'http://test.com' } });

    const postResponse = await createMeasure('2256', 'WATER', new Date());

    const confirmData = {
      measure_uuid: postResponse.body.measure_uuid,
      confirmed_value: 200
    };

    await request(app)
      .patch('/confirm')
      .send(confirmData)
      .set('Accept', 'application/json');
    
    const response = await request(app)
      .patch('/confirm')
      .send(confirmData)
      .set('Accept', 'application/json');
    
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error_code');
    expect(response.body).toHaveProperty('error_description');
    expect(response.body.error_code).toBe('CONFIRMATION_DUPLICATE');
    expect(response.body.error_description).toBe('Leitura já confirmada');
  });

  test('Test if /confirm returns not found when receive a confirmation of uncreated measure', async () => {
    const confirmData = {
      measure_uuid: 'not_found_measure',
      confirmed_value: 200
    };
    
    const response = await request(app)
      .patch('/confirm')
      .send(confirmData)
      .set('Accept', 'application/json');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error_code');
    expect(response.body).toHaveProperty('error_description');
    expect(response.body.error_code).toBe('MEASURE_NOT_FOUND');
    expect(response.body.error_description).toBe('Leitura não encontrada');
  });

  test('Test if /customer_code/list returns all measures of this customer', async () => {
    stubImageInterpret({ ok: true, payload: { value: 25 } })
    stubImageUpload({ ok: true, payload: { url: 'http://test.com' } });

    // TODO: change awaits to Promise.All when fix race condition. 
    const measures = [
      await createMeasure('1', 'GAS', new Date(1, 1, 2024)),
      await createMeasure('1', 'GAS', new Date(1, 2, 2024)),
      await createMeasure('1', 'GAS', new Date(1, 3, 2024)),
      await createMeasure('1', 'WATER', new Date(1, 1, 2024)),
      await createMeasure('1', 'WATER', new Date(1, 2, 2024)),
      await createMeasure('1', 'WATER', new Date(1, 3, 2024)),
    ];

    const response = await request(app)
      .get('/1/list')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('customer_code');
    expect(response.body.customer_code).toBe('1');
    expect(response.body).toHaveProperty('measures');
    expect(response.body.measures).toBeArray();
    expect(response.body.measures).toHaveLength(measures.length);
    expect(response.body.measures.filter((measure: any) => measure.measure_type === 'GAS')).toHaveLength(3);
    expect(response.body.measures.filter((measure: any) => measure.measure_type === 'WATER')).toHaveLength(3);
  });

  test('Test if /customer_code/list returns all measures of type water', async () => {
    stubImageInterpret({ ok: true, payload: { value: 25 } })
    stubImageUpload({ ok: true, payload: { url: 'http://test.com' } });

    // TODO: change awaits to Promise.All when fix race condition. 
    const measures = [
      await createMeasure('1', 'GAS', new Date(1, 1, 2024)),
      await createMeasure('1', 'GAS', new Date(1, 2, 2024)),
      await createMeasure('1', 'GAS', new Date(1, 3, 2024)),
      await createMeasure('1', 'WATER', new Date(1, 1, 2024)),
      await createMeasure('1', 'WATER', new Date(1, 2, 2024)),
      await createMeasure('1', 'WATER', new Date(1, 3, 2024)),
    ];

    const response = await request(app)
      .get('/1/list?measure_type=water')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('customer_code');
    expect(response.body.customer_code).toBe('1');
    expect(response.body).toHaveProperty('measures');
    expect(response.body.measures).toBeArray();
    expect(response.body.measures).toHaveLength(measures.length - 3);
    expect(response.body.measures.filter((measure: any) => measure.measure_type === 'GAS')).toHaveLength(0);
    expect(response.body.measures.filter((measure: any) => measure.measure_type === 'WATER')).toHaveLength(3);
  });

  test('Test if /customer_code/list returns all measures of type gas', async () => {
    stubImageInterpret({ ok: true, payload: { value: 25 } })
    stubImageUpload({ ok: true, payload: { url: 'http://test.com' } });

    // TODO: change awaits to Promise.All when fix race condition. 
    const measures = [
      await createMeasure('1', 'GAS', new Date(1, 1, 2024)),
      await createMeasure('1', 'GAS', new Date(1, 2, 2024)),
      await createMeasure('1', 'GAS', new Date(1, 3, 2024)),
      await createMeasure('1', 'WATER', new Date(1, 1, 2024)),
      await createMeasure('1', 'WATER', new Date(1, 2, 2024)),
      await createMeasure('1', 'WATER', new Date(1, 3, 2024)),
    ];

    const response = await request(app)
      .get('/1/list?measure_type=gas')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('customer_code');
    expect(response.body.customer_code).toBe('1');
    expect(response.body).toHaveProperty('measures');
    expect(response.body.measures).toBeArray();
    expect(response.body.measures).toHaveLength(measures.length - 3);
    expect(response.body.measures.filter((measure: any) => measure.measure_type === 'GAS')).toHaveLength(3);
    expect(response.body.measures.filter((measure: any) => measure.measure_type === 'WATER')).toHaveLength(0);
  });

  test('Test if /customer_code/list returns not found when the search result is zero', async () => {
    stubImageInterpret({ ok: true, payload: { value: 25 } })
    stubImageUpload({ ok: true, payload: { url: 'http://test.com' } });

    const response = await request(app)
      .get('/1/list?measure_type=gas')
      .send();
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error_code');
    expect(response.body).toHaveProperty('error_description');
    expect(response.body.error_code).toBe('MEASURE_NOT_FOUND');
    expect(response.body.error_description).toBe('Nenhuma leitura encontrada');
  });

  test('Test if /customer_code/list returns an error when measure type is not valid', async () => {
    stubImageInterpret({ ok: true, payload: { value: 25 } })
    stubImageUpload({ ok: true, payload: { url: 'http://test.com' } });

    const response = await request(app)
      .get('/1/list?measure_type=NOT_VALID')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error_code');
    expect(response.body).toHaveProperty('error_description');
    expect(response.body.error_code).toBe('INVALID_TYPE');
    expect(response.body.error_description).toBe('Tipo de medição não permitida');
  });
});
