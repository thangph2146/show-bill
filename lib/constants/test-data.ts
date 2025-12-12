/**
 * Test Data - theo chuẩn test script
 * Chỉ giữ 3 field: channelCode, secretKey, studentId
 * 
 * Lưu ý: 
 * - channelCode và secretKey phải được tạo và lưu trong bảng payment_credential của database
 * - Secret key cần được lấy từ database, không hardcode trong production
 */
export const TEST_DATA = {
  channelCode: 'DLC', // Từ database: channel_code = 'DLC'
  secretKey: 'DLC@!2345', // Secret key từ database (payment_credential table)
  studentId: '030740240067', // StudentId từ Postman test
};

