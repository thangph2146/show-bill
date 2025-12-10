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
  const checkSum = generateCheckSum(studentId, channelCode, secretKey);
  
  const baseUrl = domain || BASE_URL;
  const apiEndpoint = endpoint || '/ehub/payment/pay';
  const url = `${baseUrl}${apiEndpoint}`;
  
  const requestData: Record<string, unknown> = {
    channelCode,
    bills: { code: billId },
    studentId,
    checkSum,
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

const generatePayCheckSum = (studentId: string, amount: string, timestamp: string, secretKey: string): string =>
  crypto.createHash('md5').update(`${studentId}|${amount}|${timestamp}|${secretKey}`).digest('hex');

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
  const checkSum = generatePayCheckSum(studentId, amount, timestamp, secretKey);
  
  const baseUrl = domain || BASE_URL;
  const apiEndpoint = endpoint || '/ehub/payment/callback';
  const url = `${baseUrl}${apiEndpoint}`;
  
  const requestData: Record<string, unknown> = {
    billid: billId,
    amount,
    description: description || '',
    studentId,
    studentName: studentName || '',
    timestamp,
    Channelid: channelCode,
    checkSum,
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

export const ERROR_CODES: Record<string, string> = {
  '00': 'success',
  '01': 'student_not_found',
  '02': 'bad_request',
  '03': 'system_error',
  '04': 'failed',
  '05': 'not_found_debt',
};

