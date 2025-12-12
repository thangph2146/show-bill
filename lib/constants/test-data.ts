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
/**
 * Test Data - theo chuẩn test script
 * Chỉ giữ 3 field: channelCode, secretKey, studentId
 */
export const TEST_DATA = {
  channelCode: 'DLC', // Từ database: channel_code = 'DLC'
  secretKey: 'DLC@!2345', // Secret key từ database (payment_credential table)
  studentId: '030740240067', // StudentId từ Postman test
};

