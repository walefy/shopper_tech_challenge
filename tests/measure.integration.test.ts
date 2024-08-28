import { test, expect, describe, afterEach } from 'bun:test';
import request from 'supertest';
import sinon from 'sinon';
import { appExpress as app } from '../src/server';
import { GeminiService } from '../src/service/GeminiService';
import { ImageService } from '../src/service/ImageService';
import type { GeminiInterpretImageResponse } from '../src/types/GeminiInterpretImageResponse';
import type { PutImageResponse } from '../src/types/PutImageResponse';
import { restoreDb } from './scripts/restoreDb';

describe('Integration test from Measure', () => {
  const sandbox = sinon.createSandbox();

  afterEach(async () => {
    sandbox.restore();
    await restoreDb();
  });

  const stubImageUpload = () => {
    const putImageStub = sandbox.stub(ImageService.prototype, 'putImage');
    const putImageResponse: PutImageResponse = { ok: true, payload: { url: 'http://test.com' } };
    putImageStub.returns(new Promise((res, rej) => res(putImageResponse)));
  };

  const stubImageInterpret = (payload: GeminiInterpretImageResponse) => {
    const interpretImageStub = sandbox.stub(GeminiService.prototype, 'interpretImage');
    interpretImageStub.returns(new Promise((res, rej) => res(payload)));

  };

  test('Test that /upload works correctly with the correct data', async () => {  
    stubImageInterpret({ ok: true, payload: { value: 25 } })
    stubImageUpload();

    const measure_datetime = new Date();
    
    const data = {
      image: '',
      customer_code: '2',
      measure_type: 'GAS',
      measure_datetime
    };
    const response = await request(app)
    .post('/upload')
    .send(data)
    .set('Accept', 'application/json');

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
    stubImageUpload();

    const data = {
      image: '',
      customer_code: '2',
      measure_type: 'GAS',
      measure_datetime: new Date(),
    };

    await request(app)
    .post('/upload')
    .send(data)
    .set('Accept', 'application/json');

    const response = await request(app)
    .post('/upload')
    .send(data)
    .set('Accept', 'application/json');

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error_code');
    expect(response.body).toHaveProperty('error_description');
    expect(response.body.error_code).toBe('DOUBLE_REPORT');
    expect(response.body.error_description).toBe('Leitura do mês já realizada');
  });
});
