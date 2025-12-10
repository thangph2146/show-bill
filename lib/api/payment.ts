import axios from 'axios';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

const BASE_URL = 'https://tailieuso.hub.edu.vn';

export interface GetBillRequest {
  channelCode: string;
  bills: { code: string };
  studentId: string;
  checkSum: string;
}

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

export interface PayBillRequest {
  channelCode: string;
  bills: { code: string };
  studentId: string;
  amount: string;
  checkSum: string;
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

/**
 * Tạo checkSum MD5 theo format: StudentId|timestamp|channelCode|secretKey
 * 
 * Theo tài liệu:
 * - Timestamp có định dạng yyyy-MM-dd HH:mm và chuyển đổi sang đơn vị millisecond
 * - Format: StudentId|timestamp|channelCode|secretKey
 * 
 * Implementation:
 * - Lấy timestamp hiện tại dạng millisecond từ epoch (getTime())
 * - Đây tương đương với việc format yyyy-MM-dd HH:mm rồi convert sang millisecond
 */
export function generateCheckSum(
  studentId: string,
  channelCode: string,
  secretKey: string
): string {
  const now = new Date();
  // Timestamp dạng millisecond từ epoch
  // Tương đương với: format yyyy-MM-dd HH:mm -> parse Date -> getTime()
  const timestampMs = now.getTime().toString();
  const checkSumString = `${studentId}|${timestampMs}|${channelCode}|${secretKey}`;
  return crypto.createHash('md5').update(checkSumString).digest('hex');
}

/**
 * Tạo checkSum MD5 cho API getbills
 * Format: StudentId|timestamp|channelCode|secretKey (giống getBillInfo)
 * 
 * @param studentId - Mã sinh viên
 * @param channelCode - Channel code
 * @param secretKey - Secret key
 */
export function generateGetBillsCheckSum(
  studentId: string,
  channelCode: string,
  secretKey: string
): string {
  const now = new Date();
  const timestampMs = now.getTime().toString();
  const checkSumString = `${studentId}|${timestampMs}|${channelCode}|${secretKey}`;
  return crypto.createHash('md5').update(checkSumString).digest('hex');
}

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
  
  // Thêm các field bổ sung nếu có (trừ secretKey vì không nên gửi)
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
    throw error;
  }
}

/**
 * API getbills - Lấy danh sách đơn hàng của sinh viên
 * Method: POST
 * Body: channelCode, studentId, checkSum
 * 
 * @param studentId - Mã sinh viên
 * @param channelCode - Channel code của đối tác bank/cổng thanh toán
 * @param secretKey - Mật khẩu hash (secretKey từ payment_credential)
 * @param domain - Domain URL (optional, defaults to BASE_URL)
 * @param endpoint - API endpoint (optional, defaults to '/ehub/payment/getbills')
 * @param additionalFields - Các field bổ sung để thêm vào payload (optional)
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
  
  // Build payload với các field cơ bản
  const requestData: Record<string, unknown> = {
    channelCode,
    studentId,
    checkSum,
  };
  
  // Thêm các field bổ sung nếu có (trừ secretKey vì không nên gửi)
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
    throw error;
  }
}

/**
 * Tạo checkSum MD5 cho API Pay (gạch nợ)
 * Format: StudentId|amount|Timestamp|...
 * 
 * @param studentId - Mã sinh viên
 * @param amount - Tổng tiền đơn hàng
 * @param timestamp - Thời gian gọi API (millisecond)
 * @param secretKey - Secret key (mật khẩu hash)
 */
function generatePayCheckSum(
  studentId: string,
  amount: string,
  timestamp: string,
  secretKey: string
): string {
  const checkSumString = `${studentId}|${amount}|${timestamp}|${secretKey}`;
  return crypto.createHash('md5').update(checkSumString).digest('hex');
}

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
  
  // Thêm các field bổ sung nếu có (trừ secretKey vì không nên gửi)
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

