/**
 * Script test checksum với secret key từ database
 */

import crypto from 'crypto';

const studentId = '030740240067';
const timestamp = '1765420693000'; // Từ hình ảnh
const channelCode = 'DLC';
const secretKey = 'DLC@!12345'; // Từ database
const expectedCheckSum = '7807085b565a024fc3b58476ce4e712d'; // Từ hình ảnh

console.log('🔍 Test checksum với secret key từ database...\n');
console.log('Dữ liệu:');
console.log(`  StudentId: ${studentId}`);
console.log(`  Timestamp: ${timestamp}`);
console.log(`  ChannelCode: ${channelCode}`);
console.log(`  SecretKey: ${secretKey}`);
console.log(`  Expected CheckSum: ${expectedCheckSum}\n`);

// Test với channelCode (có "n")
const hashWithChannelCode = crypto
  .createHash('md5')
  .update(`${studentId}|${timestamp}|${channelCode}|${secretKey}`)
  .digest('hex');

// Test với chanelCode (thiếu "n") - theo README
const hashWithChanelCode = crypto
  .createHash('md5')
  .update(`${studentId}|${timestamp}|chanelCode|${secretKey}`)
  .digest('hex');

console.log('Kết quả:');
console.log(`  Với channelCode (có "n"): ${hashWithChannelCode}`);
console.log(`    ${hashWithChannelCode === expectedCheckSum ? '✅ KHỚP' : '❌ Không khớp'}`);
console.log(`  Với chanelCode (thiếu "n"): ${hashWithChanelCode}`);
console.log(`    ${hashWithChanelCode === expectedCheckSum ? '✅ KHỚP' : '❌ Không khớp'}\n`);

if (hashWithChannelCode === expectedCheckSum) {
  console.log('✅ Format đúng: StudentId|timestamp|channelCode|secretKey (có "n")');
} else if (hashWithChanelCode === expectedCheckSum) {
  console.log('✅ Format đúng: StudentId|timestamp|chanelCode|secretKey (thiếu "n")');
} else {
  console.log('❌ Không tìm thấy format đúng với secret key này');
  console.log('💡 Có thể secret key không đúng hoặc format khác');
}

