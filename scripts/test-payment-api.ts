/**
 * Script test API Payment
 * Test API /ehub/payment/pay dựa trên hình ảnh Postman
 * 
 * Cách chạy:
 * 1. Cài tsx: npm install -D tsx (hoặc pnpm add -D tsx)
 * 2. Chạy: npm run test:api
 * 3. Hoặc: npx tsx scripts/test-payment-api.ts
 * 
 * Với secret key (generate checksum mới):
 * - Windows PowerShell: $env:SECRET_KEY="your_key"; npm run test:api
 * - Windows CMD: set SECRET_KEY=your_key && npm run test:api
 * - Linux/Mac: SECRET_KEY=your_key npm run test:api
 * 
 * Dùng giá trị chính xác từ hình ảnh (timestamp và checksum khớp):
 * - Windows PowerShell: $env:USE_EXACT_VALUES="true"; npm run test:api
 * - Windows CMD: set USE_EXACT_VALUES=true && npm run test:api
 * - Linux/Mac: USE_EXACT_VALUES=true npm run test:api
 */

import axios from 'axios';
import crypto from 'crypto';
import https from 'https';

const BASE_URL = 'https://tailieuso.hub.edu.vn';
const ENDPOINT = '/ehub/payment/pay';

interface TestRequest {
  channelCode: string;
  studentId: string;
  checkSum: string;
  timestamp: string;
}

interface TestResponse {
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

/**
 * Generate checksum theo format: StudentId|timestamp|chanelCode|secretKey
 * 
 * Lưu ý: 
 * - Format theo README: StudentId|timestamp|chanelCode|secretKey
 * - Timestamp: định dạng yyyy-MM-dd HH:mm và chuyển đổi sang đơn vị millisecond
 * - Trong thực tế, new Date().getTime() đã trả về milliseconds
 * - Field name trong request body là "channelCode" (có "n"), nhưng trong checksum format là "chanelCode" (thiếu "n")
 */
function generateCheckSum(
  studentId: string,
  timestamp: string,
  channelCode: string,
  secretKey: string
): string {
  // Format checksum: StudentId|timestamp|chanelCode|secretKey
  // Lưu ý: README nói "chanelCode" (thiếu "n") nhưng thực tế dùng giá trị của biến channelCode (có "n")
  // Có thể README có lỗi chính tả, thực tế dùng giá trị channelCode
  const hashString = `${studentId}|${timestamp}|${channelCode}|${secretKey}`;
  return crypto.createHash('md5').update(hashString).digest('hex');
}

/**
 * Test API với dữ liệu từ hình ảnh Postman
 */
async function testPaymentApi() {
  console.log('🚀 Bắt đầu test API Payment...\n');
  console.log('⚠️  Lưu ý: Đang bỏ qua SSL certificate verification (chỉ dùng cho test)\n');

  // Dữ liệu từ hình ảnh Postman
  const useExactValues = process.env.USE_EXACT_VALUES === 'true' || process.env.USE_EXACT_VALUES === '1';
  const testData = {
    channelCode: 'DLC', // Từ database: channel_code = 'DLC'
    studentId: '030740240067',
    // Giá trị chính xác từ hình ảnh Postman (timestamp và checksum phải khớp nhau)
    // Lưu ý: Timestamp có thể đã hết hạn, API sẽ trả về "TimeStamp not match"
    exactCheckSum: '7807085b565a024fc3b58476ce4e712d',
    exactTimestamp: '1765420693000',
    // Secret key từ database (payment_credential table)
    // Sử dụng trực tiếp: secret_key = 'DLC@!2345', channelCode = 'DLC'
    // Có thể override bằng environment variable: SECRET_KEY
    secretKey: process.env.SECRET_KEY || 'DLC@!2345', // Sử dụng trực tiếp DLC@!2345
  };

  // Generate timestamp
  let timestamp: string;
  let checkSum: string;
  
  if (useExactValues) {
    // Dùng giá trị chính xác từ hình ảnh (timestamp và checksum khớp nhau)
    timestamp = testData.exactTimestamp;
    checkSum = testData.exactCheckSum;
    console.log('📋 Sử dụng giá trị chính xác từ hình ảnh Postman');
    console.log(`   Timestamp: ${timestamp}`);
    console.log(`   CheckSum: ${checkSum}`);
    console.log('⚠️  Lưu ý: Timestamp có thể đã hết hạn, API có thể trả về "TimeStamp not match"');
    console.log('💡 Để test thành công, hãy dùng SECRET_KEY để generate timestamp và checksum mới\n');
  } else if (testData.secretKey) {
    // Generate timestamp và checksum mới với SECRET_KEY
    // Timestamp: định dạng yyyy-MM-dd HH:mm và chuyển đổi sang đơn vị millisecond
    // new Date().getTime() trả về milliseconds (số milliseconds từ 1970-01-01)
    timestamp = new Date().getTime().toString();
    checkSum = generateCheckSum(
      testData.studentId,
      timestamp,
      testData.channelCode,
      testData.secretKey
    );
    console.log('🔑 Đã generate checksum mới với SECRET_KEY');
    console.log(`   Timestamp (ms): ${timestamp}`);
    console.log(`   Format checksum: StudentId|timestamp|channelCode|secretKey`);
    console.log(`   SecretKey: ${testData.secretKey}`);
    console.log(`   CheckSum: ${checkSum}`);
    console.log(`   Hash string: ${testData.studentId}|${timestamp}|${testData.channelCode}|${testData.secretKey}\n`);
  } else {
    // Không có SECRET_KEY và không dùng exact values
    // Dùng timestamp mới nhưng checksum cũ -> sẽ bị lỗi
    timestamp = new Date().getTime().toString();
    checkSum = testData.exactCheckSum;
    console.warn('⚠️  CẢNH BÁO: Đang dùng checksum cũ với timestamp mới!');
    console.warn('   Checksum sẽ không hợp lệ và API sẽ trả về lỗi "Please check again checkSum"');
    console.log('💡 Giải pháp:');
    console.log('   1. Cung cấp SECRET_KEY: $env:SECRET_KEY="your_key"; npm run test:api');
    console.log('   2. Hoặc dùng giá trị từ hình: $env:USE_EXACT_VALUES="true"; npm run test:api\n');
  }

  const requestBody: TestRequest = {
    channelCode: testData.channelCode,
    studentId: testData.studentId,
    checkSum,
    timestamp,
  };

  const url = `${BASE_URL}${ENDPOINT}`;

  console.log('📤 REQUEST:');
  console.log(`   Method: POST`);
  console.log(`   URL: ${url}`);
  console.log(`   Headers: Content-Type: application/json`);
  console.log(`   Body:`);
  console.log(JSON.stringify(requestBody, null, 2));
  console.log('');

  try {
    // Cấu hình để bỏ qua SSL certificate verification (chỉ dùng cho test)
    // Lưu ý: Không dùng trong production!
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const startTime = Date.now();
    const response = await axios.post<TestResponse>(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent,
    });
    const responseTime = Date.now() - startTime;

    console.log('✅ RESPONSE:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response Time: ${responseTime} ms`);
    console.log(`   Size: ${JSON.stringify(response.data).length} bytes`);
    console.log(`   Body:`);
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');

    // Validate response
    console.log('🔍 VALIDATION:');
    if (response.status === 200) {
      console.log('   ✓ Status code: 200 OK');
    } else {
      console.log(`   ✗ Status code: ${response.status} (mong đợi 200)`);
    }

    if (response.data.ResultCode === '00') {
      console.log('   ✓ ResultCode: 00 (Thành công)');
    } else {
      console.log(`   ✗ ResultCode: ${response.data.ResultCode}`);
      // Hiển thị thông báo lỗi nếu có
      if (typeof response.data.Data === 'string') {
        console.log(`   ✗ Message: ${response.data.Data}`);
      }
      // Hiển thị mã lỗi
      const errorMessages: Record<string, string> = {
        '01': 'Không tìm thấy sinh viên',
        '02': 'Yêu cầu không hợp lệ (thường là checksum sai)',
        '03': 'Lỗi hệ thống',
        '04': 'Thất bại',
        '05': 'Không tìm thấy nợ',
      };
      if (errorMessages[response.data.ResultCode]) {
        console.log(`   ✗ Ý nghĩa: ${errorMessages[response.data.ResultCode]}`);
      }
    }

    if (response.data.Data) {
      if (typeof response.data.Data === 'string') {
        // Data là string (thông báo lỗi)
        console.log(`   ⚠️  Data (string): ${response.data.Data}`);
      } else if (typeof response.data.Data === 'object') {
        // Data là object (thành công)
        console.log('   ✓ Có dữ liệu trong Data');
        if ('StudentName' in response.data.Data && response.data.Data.StudentName) {
          console.log(`   ✓ StudentName: ${response.data.Data.StudentName}`);
        }
        if ('Bills' in response.data.Data && response.data.Data.Bills) {
          const bills = response.data.Data.Bills as { Id?: string; DebtAmount?: string };
          if (bills.Id) {
            console.log(`   ✓ Bills.Id: ${bills.Id}`);
          }
          if (bills.DebtAmount) {
            console.log(`   ✓ Bills.DebtAmount: ${bills.DebtAmount}`);
          }
        }
      }
    } else {
      console.log('   ✗ Không có dữ liệu trong Data');
    }

    console.log('');
    console.log('✨ Test hoàn thành!');

    return response.data;
  } catch (error) {
    console.error('❌ ERROR:');
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Response:`, JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('   Không nhận được response từ server');
        console.error('   Có thể là lỗi CORS hoặc network');
      } else {
        console.error(`   Error: ${error.message}`);
      }
    } else {
      console.error('   Unknown error:', error);
    }
    throw error;
  }
}

// Chạy test
if (require.main === module) {
  testPaymentApi()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test thất bại!');
      if (error instanceof Error) {
        console.error(`   Chi tiết: ${error.message}`);
      }
      process.exit(1);
    });
}

export { testPaymentApi, generateCheckSum };

