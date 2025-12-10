/**
 * Dynamic API Caller - Gọi API động dựa trên config
 */

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

/**
 * Generate checksum theo format và fields từ template
 * Format: "field1|field2|field3|secretKey"
 */
function generateChecksum(
  format: string,
  fields: string[],
  payload: Record<string, unknown>,
  secretKey: string
): string {
  // Tạo mảng các giá trị theo thứ tự trong format
  const parts: string[] = [];
  const formatParts = format.split('|');

  formatParts.forEach((part) => {
    const trimmedPart = part.trim();
    
    // Kiểm tra nếu là field name
    const fieldIndex = fields.findIndex((f) => 
      trimmedPart.toLowerCase() === f.toLowerCase()
    );
    
    if (fieldIndex !== -1) {
      // Lấy giá trị từ payload
      const fieldName = fields[fieldIndex];
      let value = payload[fieldName]?.toString() || '';
      
      // Xử lý field đặc biệt: bills -> lấy code
      if (fieldName === 'bills' && typeof payload.bills === 'object' && payload.bills !== null) {
        const billsObj = payload.bills as { code?: string };
        value = billsObj.code || '';
      }
      
      parts.push(value);
    } else if (trimmedPart.toLowerCase() === 'timestamp' || trimmedPart === 'Timestamp') {
      // Timestamp tự động
      const timestamp = new Date().getTime().toString();
      parts.push(timestamp);
    } else if (trimmedPart.toLowerCase() === 'secretkey') {
      // Secret key
      parts.push(secretKey);
    } else {
      // Giữ nguyên nếu không match
      parts.push(trimmedPart);
    }
  });

  // Join bằng dấu |
  const checkSumString = parts.join('|');
  
  return crypto.createHash('md5').update(checkSumString).digest('hex');
}

/**
 * Build payload từ template và form values
 */
function buildPayload(
  template: ApiTemplate,
  formValues: Record<string, unknown>,
  secretKey?: string
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  // Điền các field từ form values
  template.fields.forEach((field) => {
    if (formValues[field.name] !== undefined) {
      payload[field.name] = formValues[field.name];
    } else if (field.defaultValue !== undefined) {
      payload[field.name] = field.defaultValue;
    }
  });

  // Xử lý các field đặc biệt
  if (template.id === 'getBillInfo') {
    // Nếu có billId trong formValues, tạo bills object
    if (formValues.billId) {
      payload.bills = { code: formValues.billId };
    } else if (formValues.bills) {
      // Nếu đã có bills object, giữ nguyên
      payload.bills = formValues.bills;
    }
  }

  // Generate checksum nếu có
  if (template.checksumGenerator && secretKey) {
    const checksum = generateChecksum(
      template.checksumGenerator.format,
      template.checksumGenerator.fields,
      payload,
      secretKey
    );
    payload.checkSum = checksum;
  }

  // Generate timestamp nếu cần
  if (template.id === 'payBill' && !payload.timestamp) {
    payload.timestamp = new Date().getTime().toString();
  }

  return payload;
}

/**
 * Gọi API động dựa trên template hoặc config tùy chỉnh
 */
export async function callDynamicApi<T = unknown>(
  request: DynamicApiRequest
): Promise<DynamicApiResponse<T>> {
  const baseUrl = request.baseUrl || DEFAULT_BASE_URL;
  const url = `${baseUrl}${request.endpoint}`;

  // Build payload
  let payload = request.payload;

  // Nếu có templateId, build payload từ template
  if (request.templateId) {
    const { getApiTemplate } = await import('@/lib/config/api-templates');
    const template = getApiTemplate(request.templateId);
    if (template) {
      payload = buildPayload(template, request.payload, request.secretKey);
    }
  }

  // Build axios config
  const axiosConfig: AxiosRequestConfig = {
    method: request.method,
    url,
    headers: {
      'Content-Type': 'application/json',
      ...request.headers,
    },
  };

  // Thêm data cho POST, PUT, PATCH
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    axiosConfig.data = payload;
    logger.request(request.method, url, payload);
  } else {
    // GET, DELETE: thêm params
    axiosConfig.params = payload;
    logger.request(request.method, url);
  }

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

/**
 * Gọi API từ template
 */
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

