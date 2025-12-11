/**
 * Script tính toán SECRET_KEY từ dữ liệu trong hình ảnh Postman
 * 
 * Format checksum: StudentId|timestamp|chanelCode|secretKey (theo README.md)
 * 
 * Từ hình ảnh:
 * - studentId: "030740240067"
 * - timestamp: "1765420693000"
 * - channelCode: "DLC"
 * - checkSum: "7807085b565a024fc3b58476ce4e712d"
 * 
 * Chạy: npx tsx scripts/calculate-secret-key.ts
 */

import crypto from 'crypto';

// Dữ liệu từ hình ảnh Postman
const studentId = '030740240067';
const timestamp = '1765420693000';
const channelCode = 'DLC';
const checkSum = '7807085b565a024fc3b58476ce4e712d';

console.log('🔍 Tính toán SECRET_KEY từ dữ liệu hình ảnh...\n');
console.log('Dữ liệu từ hình:');
console.log(`  StudentId: ${studentId}`);
console.log(`  Timestamp: ${timestamp}`);
console.log(`  ChannelCode: ${channelCode}`);
console.log(`  CheckSum: ${checkSum}\n`);

// Format: StudentId|timestamp|chanelCode|secretKey (theo README)
// Lưu ý: trong checksum format dùng "chanelCode" (thiếu "n"), không phải "channelCode"
const hashString = `${studentId}|${timestamp}|${channelCode}|`;
console.log(`Hash string (không có secretKey): ${hashString}`);
console.log(`Format: StudentId|timestamp|chanelCode|secretKey`);

// Thử brute force với các secret key phổ biến
const commonSecrets = [
  'DLC',
  'dlc',
  'secret',
  'SECRET',
  'key',
  'KEY',
  'tailieuso',
  'TAILIEUSO',
  'hub',
  'HUB',
  'edu',
  'EDU',
  'payment',
  'PAYMENT',
];

console.log('\n🔑 Thử với các secret key phổ biến:');
let found = false;

for (const secret of commonSecrets) {
  const testHash = crypto.createHash('md5').update(`${hashString}${secret}`).digest('hex');
  if (testHash === checkSum) {
    console.log(`\n✅ Tìm thấy SECRET_KEY: "${secret}"`);
    console.log(`   Hash: ${testHash}`);
    found = true;
    break;
  }
  console.log(`   "${secret}" -> ${testHash} (không khớp)`);
}

if (!found) {
  console.log('\n❌ Không tìm thấy SECRET_KEY trong danh sách phổ biến');
  console.log('\n💡 Có thể thử:');
  console.log('   1. Hỏi admin hệ thống về SECRET_KEY');
  console.log('   2. Kiểm tra trong database (bảng payment_credential)');
  console.log('   3. Xem trong file config của server');
  console.log('\n📝 Format checksum: StudentId|timestamp|chanelCode|secretKey (theo README.md)');
  console.log(`   Hash string: ${hashString}[SECRET_KEY]`);
  console.log(`   Expected hash: ${checkSum}`);
}

