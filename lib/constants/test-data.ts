/**
 * Test Data cho API Payment
 * 
 * Lưu ý: 
 * - channelCode và secretKey phải được tạo và lưu trong bảng payment_credential của database
 * - Cán bộ quản trị truy cập vào database để tạo thêm channelCode và secretKey
 * - Secret key cần được lấy từ database, không hardcode trong production
 */

/**
 * Test Data mặc định - Dữ liệu từ Postman test thành công
 * Body request mẫu (từ Postman):
 * {
 *   "channelCode": "DLC",
 *   "studentId": "030740240067",
 *   "checkSum": "7807085b565a024fc3b58476ce4e712d",
 *   "timestamp": "1765420693000"
 * }
 * 
 * Response thành công (200 OK):
 * {
 *   "Data": {
 *     "StudentName": "Phạm Nguyễn Ngọc Huyền",
 *     "Bills": {
 *       "Description": "Payment from tailieuso with amount: 100000",
 *       "Id": "f14ad4a5-11d5-498e-83cf-3e5587fb164d",
 *       "DebtAmount": "100000",
 *       "CreateDate": "1765346759815"
 *     },
 *     "StudentId": "030740240067"
 *   },
 *   "ResultCode": "00"
 * }
 */
export const TEST_DATA = {
  channelCode: 'DLC',
  secretKey: 'DLC@!2345', // Secret key từ database (payment_credential) - đã test thành công
  billId: 'f14ad4a5-11d5-498e-83cf-3e5587fb164d', // BillId từ response
  studentId: '030740240067',
};

/**
 * Test Data thay thế - Ví dụ với email làm billId
 */
export const TEST_DATA_ALT = {
  channelCode: 'DLC',
  secretKey: '',
  billId: 'superadmin@hub.edu.vn',
  studentId: '1951012345',
};

/**
 * Test Data với response mẫu từ Postman test thành công
 * Response mẫu từ Postman (200 OK):
 * {
 *   "Data": {
 *     "StudentName": "Phạm Nguyễn Ngọc Huyền",
 *     "Bills": {
 *       "Description": "Payment from tailieuso with amount: 100000",
 *       "Id": "f14ad4a5-11d5-498e-83cf-3e5587fb164d",
 *       "DebtAmount": "100000",
 *       "CreateDate": "1765346759815"
 *     },
 *     "StudentId": "030740240067"
 *   },
 *   "ResultCode": "00"
 * }
 */
export const TEST_DATA_WITH_RESPONSE = {
  ...TEST_DATA,
  expectedResponse: {
    Data: {
      StudentName: 'Phạm Nguyễn Ngọc Huyền',
      Bills: {
        Description: 'Payment from tailieuso with amount: 100000',
        Id: 'f14ad4a5-11d5-498e-83cf-3e5587fb164d',
        DebtAmount: '100000',
        CreateDate: '1765346759815',
      },
      StudentId: '030740240067',
    },
    ResultCode: '00',
  },
};

/**
 * Test Data từ tài liệu gốc (giữ lại để tham khảo)
 */
export const TEST_DATA_DOC = {
  channelCode: 'DLC',
  secretKey: '',
  billId: '0d6a5f25-a110-49f4-8d40-6cfaa06668bf',
  studentId: '1234567890',
  expectedResponse: {
    Data: {
      StudentName: 'tuanv vu',
      Bills: {
        Description: 'Payment from tailieuso with amount: 1000000',
        Id: '0d6a5f25-a110-49f4-8d40-6cfaa06668bf',
        DebtAmount: '1000000',
        CreateDate: '1727423756329',
      },
      StudentId: '1234567890',
    },
    ResultCode: '00',
  },
};

