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


const generateCheckSumBase = (studentId: string, channelCode: string, secretKey: string): string => {
  const timestampMs = new Date().getTime().toString();
  return crypto.createHash('md5').update(`${studentId}|${timestampMs}|${channelCode}|${secretKey}`).digest('hex');
};

export const generateCheckSum = generateCheckSumBase;

export async function getBillInfo(
  studentId: string,
  channelCode: string,
  secretKey: string,
  additionalFields?: Record<string, unknown>
): Promise<GetBillResponse> {
  const timestamp = new Date().getTime().toString();
  const checkSum = generateCheckSum(studentId, channelCode, secretKey);
  
  const url = `${BASE_URL}/ehub/payment/pay`;
  
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
    const { callApi } = await import('@/lib/api/proxy-helper');
    return await callApi<GetBillResponse>('/api/payment/pay', url, requestData);
  } catch (error) {
    logger.error('Request failed:', error);
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
  additionalFields?: Record<string, unknown>
): Promise<{ status: number; data: string }> {
  const timestamp = new Date().getTime().toString();
  const checkSum = generatePayCheckSum(studentId, timestamp, channelCode, secretKey);
  
  const url = `${BASE_URL}/ehub/payment/callback`;
  
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
    const { callApi } = await import('@/lib/api/proxy-helper');
    const data = await callApi<string>('/api/payment/callback', url, requestData);
    return { status: 200, data };
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

