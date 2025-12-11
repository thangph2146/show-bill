import axios from 'axios';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

const BASE_URL = 'https://tailieuso.hub.edu.vn';

export interface GetBillResponse {
  Data: {
    StudentName: string;
    Bills: {
      Description: string;
      Id: string;
      DebtAmount: string;
      CreateDate: string;
    };
    StudentId: string;
  };
  ResultCode: string;
}

export interface GetBillsResponse {
  bills: Array<{
    billId: string;
    description: string;
    createDate: string;
    customerId: string;
    customerName: string;
    amount: string;
    checkSum: string;
  }>;
  studentId: string;
  studentName: string;
  totalAmount: string;
}

const generateCheckSumBase = (studentId: string, channelCode: string, secretKey: string): string => {
  const timestampMs = new Date().getTime().toString();
  return crypto.createHash('md5').update(`${studentId}|${timestampMs}|${channelCode}|${secretKey}`).digest('hex');
};

export const generateCheckSum = generateCheckSumBase;
export const generateGetBillsCheckSum = generateCheckSumBase;

export async function getBillInfo(
  billId: string,
  studentId: string,
  channelCode: string,
  secretKey: string,
  domain?: string,
  endpoint?: string,
  additionalFields?: Record<string, unknown>
): Promise<GetBillResponse> {
  const timestamp = new Date().getTime().toString();
  const checkSum = generateCheckSum(studentId, channelCode, secretKey);
  
  const baseUrl = domain || BASE_URL;
  const apiEndpoint = endpoint || '/ehub/payment/pay';
  const url = `${baseUrl}${apiEndpoint}`;
  
  // Theo README: API /ehub/payment/pay chỉ cần channelCode, studentId, checkSum, timestamp
  // KHÔNG có bills trong body request
  const requestData: Record<string, unknown> = {
    channelCode,
    studentId,
    checkSum,
    timestamp,
  };
  
  if (additionalFields) {
    Object.entries(additionalFields).forEach(([key, value]) => {
      if (key !== 'secretKey' && value !== undefined && value !== '') {
        requestData[key] = value;
      }
    });
  }

  logger.request('POST', url, requestData);

  try {
    const response = await axios.post<GetBillResponse>(url, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    logger.error('Request failed:', error);
    if (axios.isAxiosError(error)) {
      // Đảm bảo error message luôn có thông tin CORS khi là lỗi CORS
      if (!error.response && (error.code === 'ERR_FAILED' || error.code === 'ERR_NETWORK')) {
        const corsMessage = `CORS: ${url} - Access blocked by CORS policy`;
        (error as Error).message = corsMessage;
        // Đảm bảo message được set vào error object
        if (error.message !== corsMessage) {
          error.message = corsMessage;
        }
      }
    }
    throw error;
  }
}

/**
 * API getbills - Lấy danh sách đơn hàng của sinh viên
 */
export async function getBills(
  studentId: string,
  channelCode: string,
  secretKey: string,
  domain?: string,
  endpoint?: string,
  additionalFields?: Record<string, unknown>
): Promise<GetBillsResponse> {
  const checkSum = generateGetBillsCheckSum(studentId, channelCode, secretKey);
  
  const baseUrl = domain || BASE_URL;
  const apiEndpoint = endpoint || '/ehub/payment/getbills';
  const url = `${baseUrl}${apiEndpoint}`;
  
  const requestData: Record<string, unknown> = { channelCode, studentId, checkSum };
  
  if (additionalFields) {
    Object.entries(additionalFields).forEach(([key, value]) => {
      if (key !== 'secretKey' && value !== undefined && value !== '') {
        requestData[key] = value;
      }
    });
  }

  logger.request('POST', url, requestData);

  try {
    const response = await axios.post<GetBillsResponse>(url, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    logger.error('Request failed:', error);
    if (axios.isAxiosError(error)) {
      // Đảm bảo error message luôn có thông tin CORS khi là lỗi CORS
      if (!error.response && (error.code === 'ERR_FAILED' || error.code === 'ERR_NETWORK')) {
        const corsMessage = `CORS: ${url} - Access blocked by CORS policy`;
        (error as Error).message = corsMessage;
        // Đảm bảo message được set vào error object
        if (error.message !== corsMessage) {
          error.message = corsMessage;
        }
      }
    }
    throw error;
  }
}

// Theo README: CheckSum format cho API callback: StudentId|timestamp|chanelCode|secretKey
const generatePayCheckSum = (studentId: string, timestamp: string, channelCode: string, secretKey: string): string =>
  crypto.createHash('md5').update(`${studentId}|${timestamp}|${channelCode}|${secretKey}`).digest('hex');

export async function payBill(
  billId: string,
  studentId: string,
  amount: string,
  channelCode: string,
  secretKey: string,
  studentName?: string,
  description?: string,
  domain?: string,
  endpoint?: string,
  additionalFields?: Record<string, unknown>
): Promise<{ status: number; data: string }> {
  const timestamp = new Date().getTime().toString();
  const checkSum = generatePayCheckSum(studentId, timestamp, channelCode, secretKey);
  
  const baseUrl = domain || BASE_URL;
  const apiEndpoint = endpoint || '/ehub/payment/callback';
  const url = `${baseUrl}${apiEndpoint}`;
  
  // Theo README: API /ehub/payment/callback cần: channelCode, bills (với code), studentId, amount, checkSum, timestamp
  const requestData: Record<string, unknown> = {
    channelCode,
    bills: { code: billId },
    studentId,
    amount,
    checkSum,
    timestamp,
  };
  
  if (additionalFields) {
    Object.entries(additionalFields).forEach(([key, value]) => {
      if (key !== 'secretKey' && value !== undefined && value !== '') {
        requestData[key] = value;
      }
    });
  }

  logger.request('POST', url, requestData);

  try {
    const response = await axios.post(url, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    logger.error('Request failed:', error);
    throw error;
  }
}

// Theo README.md - Mã lỗi từ API
export const ERROR_CODES: Record<string, string> = {
  '00': 'Thành công',
  '01': 'Không tìm thấy sinh viên',
  '02': 'Yêu cầu không hợp lệ',
  '03': 'Lỗi hệ thống',
  '04': 'Thất bại',
  '05': 'Không tìm thấy nợ',
};

