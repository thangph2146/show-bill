# Scripts Test API

## Test Payment API

Script test API `/ehub/payment/pay` dựa trên hình ảnh Postman.

### Cài đặt

Cài đặt dependencies (nếu chưa có):
```bash
pnpm install
# hoặc
npm install
```

### Cách sử dụng

#### 1. Chạy với giá trị mặc định (từ hình ảnh)

```bash
npm run test:api
```

Script sẽ tự động generate timestamp và checksum mới (nếu có SECRET_KEY).

#### 2. Chạy với giá trị chính xác từ hình ảnh (timestamp và checksum khớp)

**Windows PowerShell:**
```powershell
$env:USE_EXACT_VALUES="true"
npm run test:api
```

**Windows CMD:**
```cmd
set USE_EXACT_VALUES=true && npm run test:api
```

**Linux/Mac:**
```bash
USE_EXACT_VALUES=true npm run test:api
```

#### 3. Chạy với SECRET_KEY để generate checksum hợp lệ mới

**Windows PowerShell:**
```powershell
$env:SECRET_KEY="your_secret_key_here"
npm run test:api
```

**Windows CMD:**
```cmd
set SECRET_KEY=your_secret_key_here && npm run test:api
```

**Linux/Mac:**
```bash
SECRET_KEY=your_secret_key_here npm run test:api
```

#### 4. Chạy trực tiếp với tsx

```bash
npx tsx scripts/test-payment-api.ts
```

### Dữ liệu test

Script sử dụng dữ liệu từ hình ảnh Postman:
- **channelCode**: `DLC`
- **studentId**: `030740240067`
- **endpoint**: `/ehub/payment/pay`
- **method**: `POST`

### Response mong đợi

```json
{
  "Data": {
    "StudentName": "Phạm Nguyễn Ngọc Huyền",
    "Bills": {
      "Description": "Payment from tailieuso with amount: 100000",
      "Id": "f14ad4a5-11d5-498e-83cf-3e5587fb164d",
      "DebtAmount": "100000",
      "CreateDate": "1765346759815"
    },
    "StudentId": "030740240067"
  },
  "ResultCode": "00"
}
```

### Lưu ý

- **Checksum**: Được generate theo format: `StudentId|timestamp|chanelCode|secretKey` (theo README.md, dùng "chanelCode" thiếu "n" trong format checksum, nhưng field name trong request body vẫn là "channelCode" có "n")
- **Timestamp và Checksum phải khớp nhau**: Nếu dùng checksum cũ với timestamp mới, API sẽ trả về lỗi "Please check again checkSum" (ResultCode: 02)
- **Cách test đúng**:
  - Dùng `USE_EXACT_VALUES=true` để test với giá trị chính xác từ hình ảnh (timestamp và checksum khớp)
  - Hoặc cung cấp `SECRET_KEY` để script tự động generate checksum hợp lệ với timestamp mới
- **SSL Certificate**: Script tự động bỏ qua SSL certificate verification để tránh lỗi "unable to verify the first certificate". Điều này chỉ phù hợp cho môi trường test, không nên dùng trong production.
- **Mã lỗi API**:
  - `00`: Thành công
  - `01`: Không tìm thấy sinh viên
  - `02`: Yêu cầu không hợp lệ (thường là checksum sai)
  - `03`: Lỗi hệ thống
  - `04`: Thất bại
  - `05`: Không tìm thấy nợ

