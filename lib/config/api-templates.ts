/**
 * API Templates - Mẫu API có sẵn để test
 * Cho phép chọn API mẫu hoặc tự config endpoint, method, payload
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  defaultValue?: string | number | boolean;
  placeholder?: string;
  description?: string;
}

export interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  method: HttpMethod;
  endpoint: string;
  baseUrl?: string; // Nếu không có, dùng BASE_URL mặc định
  fields: ApiField[];
  checksumGenerator?: {
    format: string; // Format: "field1|field2|field3|secretKey"
    fields: string[]; // Danh sách field names để tạo checksum
  };
  responseHandler?: (data: unknown) => unknown; // Transform response nếu cần
}

export const API_TEMPLATES: Record<string, ApiTemplate> = {
  getbills: {
    id: 'getbills',
    name: 'Lấy danh sách đơn hàng (getbills)',
    description: 'API lấy danh sách đơn hàng của sinh viên',
    method: 'POST',
    endpoint: '/ehub/payment/getbills',
    fields: [
      {
        name: 'channelCode',
        label: 'Channel Code',
        type: 'string',
        required: true,
        defaultValue: 'DLC',
        placeholder: 'DLC',
      },
      {
        name: 'studentId',
        label: 'Student ID',
        type: 'string',
        required: true,
        placeholder: '030740240067',
      },
      {
        name: 'checkSum',
        label: 'CheckSum (tự động)',
        type: 'string',
        required: false,
        description: 'Được tạo tự động từ StudentId|timestamp|channelCode|secretKey',
      },
    ],
    checksumGenerator: {
      format: 'StudentId|timestamp|channelCode|secretKey',
      fields: ['studentId', 'channelCode'],
    },
  },
  getBillInfo: {
    id: 'getBillInfo',
    name: 'Lấy thông tin đơn hàng (pay)',
    description: 'API lấy thông tin chi tiết một đơn hàng',
    method: 'POST',
    endpoint: '/ehub/payment/pay',
    fields: [
      {
        name: 'channelCode',
        label: 'Channel Code',
        type: 'string',
        required: true,
        defaultValue: 'DLC',
        placeholder: 'DLC',
      },
      {
        name: 'bills',
        label: 'Bills (code)',
        type: 'object',
        required: true,
        description: 'Object với field "code" là billId',
      },
      {
        name: 'studentId',
        label: 'Student ID',
        type: 'string',
        required: true,
        placeholder: '030740240067',
      },
      {
        name: 'checkSum',
        label: 'CheckSum (tự động)',
        type: 'string',
        required: false,
        description: 'Được tạo tự động từ StudentId|timestamp|channelCode|secretKey',
      },
    ],
    checksumGenerator: {
      format: 'StudentId|timestamp|channelCode|secretKey',
      fields: ['studentId', 'channelCode'],
    },
  },
  payBill: {
    id: 'payBill',
    name: 'Thanh toán đơn hàng (callback)',
    description: 'API thanh toán/gạch nợ đơn hàng',
    method: 'POST',
    endpoint: '/ehub/payment/callback',
    fields: [
      {
        name: 'billid',
        label: 'Bill ID',
        type: 'string',
        required: true,
        placeholder: '0d6a5f25-a110-49f4-8d40-6cfaa06668bf',
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'string',
        required: true,
        placeholder: '1000000',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'string',
        required: false,
        placeholder: 'Payment description',
      },
      {
        name: 'studentId',
        label: 'Student ID',
        type: 'string',
        required: true,
        placeholder: '030740240067',
      },
      {
        name: 'studentName',
        label: 'Student Name',
        type: 'string',
        required: false,
        placeholder: 'Nguyễn Văn A',
      },
      {
        name: 'timestamp',
        label: 'Timestamp (tự động)',
        type: 'string',
        required: false,
        description: 'Được tạo tự động từ thời gian hiện tại (millisecond)',
      },
      {
        name: 'Channelid',
        label: 'Channel ID',
        type: 'string',
        required: true,
        defaultValue: 'DLC',
        placeholder: 'DLC',
      },
      {
        name: 'checkSum',
        label: 'CheckSum (tự động)',
        type: 'string',
        required: false,
        description: 'Được tạo tự động từ StudentId|amount|Timestamp|secretKey',
      },
    ],
    checksumGenerator: {
      format: 'StudentId|amount|Timestamp|secretKey',
      fields: ['studentId', 'amount', 'Channelid'],
    },
  },
};

/**
 * Lấy danh sách tất cả API templates
 */
export function getApiTemplates(): ApiTemplate[] {
  return Object.values(API_TEMPLATES);
}

/**
 * Lấy API template theo ID
 */
export function getApiTemplate(id: string): ApiTemplate | undefined {
  return API_TEMPLATES[id];
}

