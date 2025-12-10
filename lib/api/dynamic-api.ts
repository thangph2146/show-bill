import axios, { AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { ApiTemplate, HttpMethod } from '@/lib/config/api-templates';

const DEFAULT_BASE_URL = 'https://tailieuso.hub.edu.vn';

export interface DynamicApiRequest {
  templateId?: string; // ID của API template
  method: HttpMethod;
  endpoint: string;
  baseUrl?: string;
  payload: Record<string, unknown>;
  secretKey?: string; // Dùng để generate checksum nếu có
  headers?: Record<string, string>;
}

export interface DynamicApiResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

function generateChecksum(
  format: string,
  fields: string[],
  payload: Record<string, unknown>,
  secretKey: string
): string {
  const parts: string[] = [];
  format.split('|').forEach((part) => {
    const trimmed = part.trim().toLowerCase();
    const fieldIndex = fields.findIndex(f => trimmed === f.toLowerCase());
    if (fieldIndex !== -1) {
      const fieldName = fields[fieldIndex];
      let value = payload[fieldName]?.toString() || '';
      if (fieldName === 'bills' && typeof payload.bills === 'object' && payload.bills !== null) {
        value = (payload.bills as { code?: string }).code || '';
      }
      parts.push(value);
    } else if (trimmed === 'timestamp') {
      parts.push(new Date().getTime().toString());
    } else if (trimmed === 'secretkey') {
      parts.push(secretKey);
    } else {
      parts.push(part.trim());
    }
  });
  return crypto.createHash('md5').update(parts.join('|')).digest('hex');
}

function buildPayload(
  template: ApiTemplate,
  formValues: Record<string, unknown>,
  secretKey?: string
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  template.fields.forEach((field) => {
    payload[field.name] = formValues[field.name] ?? field.defaultValue;
  });
  if (template.id === 'getBillInfo' && formValues.billId) {
    payload.bills = { code: formValues.billId };
  }
  if (template.checksumGenerator && secretKey) {
    payload.checkSum = generateChecksum(template.checksumGenerator.format, template.checksumGenerator.fields, payload, secretKey);
  }
  if (template.id === 'payBill' && !payload.timestamp) {
    payload.timestamp = new Date().getTime().toString();
  }
  return payload;
}

export async function callDynamicApi<T = unknown>(
  request: DynamicApiRequest
): Promise<DynamicApiResponse<T>> {
  const url = `${request.baseUrl || DEFAULT_BASE_URL}${request.endpoint}`;
  let payload = request.payload;
  if (request.templateId) {
    const { getApiTemplate } = await import('@/lib/config/api-templates');
    const template = getApiTemplate(request.templateId);
    if (template) payload = buildPayload(template, request.payload, request.secretKey);
  }
  const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(request.method);
  const axiosConfig: AxiosRequestConfig = {
    method: request.method,
    url,
    headers: { 'Content-Type': 'application/json', ...request.headers },
    ...(isBodyMethod ? { data: payload } : { params: payload }),
  };
  logger.request(request.method, url, isBodyMethod ? payload : undefined);

  try {
    const response = await axios(axiosConfig);
    return {
      status: response.status,
      data: response.data as T,
      headers: response.headers as Record<string, string>,
    };
  } catch (error) {
    logger.error('Request failed:', error);
    throw error;
  }
}

export async function callApiFromTemplate<T = unknown>(
  templateId: string,
  formValues: Record<string, unknown>,
  secretKey?: string,
  baseUrl?: string
): Promise<DynamicApiResponse<T>> {
  const { getApiTemplate } = await import('@/lib/config/api-templates');
  const template = getApiTemplate(templateId);

  if (!template) {
    throw new Error(`Template ${templateId} không tồn tại`);
  }

  return callDynamicApi<T>({
    templateId,
    method: template.method,
    endpoint: template.endpoint,
    baseUrl: baseUrl || template.baseUrl,
    payload: formValues,
    secretKey,
  });
}

