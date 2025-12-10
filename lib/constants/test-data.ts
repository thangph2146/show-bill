/**
 * Test Data cho API Payment
 * 
 * Lưu ý: 
 * - channelCode và secretKey phải được tạo và lưu trong bảng payment_credential của database
 * - Cán bộ quản trị truy cập vào database để tạo thêm channelCode và secretKey
 * - Secret key cần được lấy từ database, không hardcode trong production
 */

/**
 * Test Data mặc định - Ví dụ từ tài liệu
 * Body request mẫu:
 * {
 *   "channelCode": "DLC",
 *   "bills": {"code":"0d6a5f25-a110-49f4-8d40-6cfaa06668bf"},
 *   "studentId":"1234567890",
 *   "checkSum": "b54652ddff7c3ba2402975d70da7a60a"
 * }
 */
export const TEST_DATA = {
  channelCode: 'DLC',
  secretKey: '', // TODO: Lấy từ database payment_credential (channel_code='DLC')
  billId: '0d6a5f25-a110-49f4-8d40-6cfaa06668bf',
  studentId: '1234567890',
};

/**
 * Test Data thay thế - Ví dụ với email làm billId
 */
export const TEST_DATA_ALT = {
  channelCode: 'DLC',
  secretKey: '', // TODO: Lấy từ database payment_credential (channel_code='DLC')
  billId: 'superadmin@hub.edu.vn',
  studentId: '1951012345',
};

/**
 * Test Data với response mẫu từ tài liệu
 * Response mẫu:
 * {
 *   "Data": {
 *     "StudentName": "tuanv vu",
 *     "Bills": {
 *       "Description": "Payment from tailieuso with amount: 1000000",
 *       "Id": "0d6a5f25-a110-49f4-8d40-6cfaa06668bf",
 *       "DebtAmount": "1000000",
 *       "CreateDate": "1727423756329"
 *     },
 *     "StudentId": "1234567890"
 *   },
 *   "ResultCode": "00"
 * }
 */
export const TEST_DATA_WITH_RESPONSE = {
  ...TEST_DATA,
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

