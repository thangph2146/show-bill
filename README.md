# Show Bill - Cổng Thanh Toán Trực Tuyến HUB

Dự án [Next.js](https://nextjs.org) tích hợp với DSpace để xử lý thanh toán trực tuyến.

## Bắt Đầu

Chạy development server:

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
# hoặc
bun dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## Kết Nối DSpace Và Cổng Thanh Toán Trực Tuyến HUB

### 1. Luồng Nghiệp Vụ (Đã Thống Nhất Với HUB)

#### Bước 1: Tìm Kiếm và Thêm Vào Giỏ Hàng
Bạn đọc truy cập vào DSpace thực hiện tìm kiếm tài liệu, thêm tài liệu vào giỏ hàng.

#### Bước 2: Chọn Hình Thức Thanh Toán
Bạn đọc thực hiện thanh toán, chọn hình thức thanh toán bằng EPAY.

#### Bước 3: Truyền Thông Tin
DSpace truyền thông tin `Bill_ID`, `Student_ID` cho EPAY thông qua URL do EPAY cung cấp.

#### Bước 4: Đăng Nhập và Kiểm Tra Đơn Hàng
Bạn đọc tiến hành login vào EPAY.
- **Nếu login thất bại** => Kết thúc.
- **Nếu login thành công** => EPAY sử dụng API lấy thông tin đơn hàng để kiểm tra số tiền cần thanh toán.

#### Bước 5: Thực Hiện Thanh Toán
Thực hiện thanh toán theo luồng nghiệp vụ của EPAY.
- **Nếu thanh toán thất bại** => Kết thúc.
- **Nếu thanh toán thành công** => EPAY sử dụng API thanh toán đơn hàng để thông báo kết quả thanh toán cho DSpace.

#### Bước 6: Xử Lý Kết Quả
DSpace kiểm tra thông tin, tiến hành gạch nợ và trả kết quả xử lý cho EPAY.
- **Nếu kết quả trả mã 200** → Gạch nợ thành công, EPAY thông báo cho bạn đọc và kết thúc thao tác.
- **Nếu kết quả trả mã khác 200** → Gạch nợ thất bại, EPAY thông báo cho bạn đọc lý do, hoàn lại tiền cho bạn đọc và kết thúc thao tác. (Lưu ý: Bạn đọc có thể được phép thực hiện lại thao tác thanh toán tùy theo chính sách và chức năng của EPAY).

### 2. Thông Tin API Kết Nối

#### 2.1. API Lấy Thông Tin Đơn Hàng

**Thông tin API:**

- **Base URL:** `https://tailieuso.hub.edu.vn`
- **URL:** `/ehub/payment/pay`
- **Method:** `POST`
- **Content-type:** `application/json`

**Body Request:**

| Tham số | Mô tả |
|---------|-------|
| `channelCode` | Channelcode phải được tạo và lưu trong bảng `payment_credential` của database. Cán bộ quản trị truy cập vào database để tạo thêm channelCode và secretKey |
| `studentId` | Mã số sinh viên |
| `checkSum` | Được mã hóa theo định dạng MD5 theo cấu trúc: `StudentId|timestamp|chanelCode|secretKey` |
| `timestamp` | Timestamp có định dạng `yyyy-MM-dd HH:mm` và chuyển đổi sang đơn vị millisecond |

**Lưu ý:** Timestamp có định dạng `yyyy-MM-dd HH:mm` và chuyển đổi sang đơn vị millisecond.

**Ví dụ về body truyền vào:**

```json
{
    "channelCode": "DLC",
    "studentId": "1234567890",
    "checkSum": "b54652ddff7c3ba2402975d70da7a60a",
    "timestamp": "1765419470000"
}
```

**Response:**

| Tham số | Mô tả |
|---------|-------|
| `StudentName` | Họ tên Sinh viên |
| `Description` | Mô tả đơn hàng |
| `Id` | ID đơn hàng |
| `DebtAmount` | Giá trị đơn hàng |
| `CreateDate` | Ngày tạo đơn hàng |
| `StudentId` | Mã số thẻ |
| `ResultCode` | Mã lỗi |

**Ví dụ về kết quả trả về của API:**

```json
{
    "Data": {
        "StudentName": "tuanv vu",
        "Bills": {
            "Description": "Payment from tailieuso with amount: 1000000",
            "Id": "0d6a5f25-a110-49f4-8d40-6cfaa06668bf",
            "DebtAmount": "1000000",
            "CreateDate": "1727423756329"
        },
        "StudentId": "1234567890"
    },
    "ResultCode": "00"
}
```

**Mã lỗi có thể trả ra trong API:**

| Code | Mô tả |
|------|-------|
| `00` | success |
| `01` | student_not_found |
| `02` | bad_request |
| `03` | system_error |
| `04` | failed |
| `05` | not_found_debt |

#### 2.2. API Thanh Toán Đơn Hàng

**Thông tin API:**

- **Base URL:** `https://tailieuso.hub.edu.vn`
- **URL:** `/ehub/payment/callback`
- **Method:** `POST`
- **Content-type:** `application/json`

**Body Request:**

| Tham số | Mô tả |
|---------|-------|
| `channelCode` | Channelcode phải được tạo và lưu trong bảng `payment_credential` của database. Cán bộ quản trị truy cập vào database để tạo thêm channelCode và secretKey |
| `bills` | Bill_ID được truyền theo cấu trúc: `"bills": {"code":"0d6a5f25-a110-49f4-8d40-6cfaa06668bf"}` |
| `studentId` | Mã số sinh viên |
| `amount` | Tổng số tiền thanh toán của bill |
| `checkSum` | Được mã hóa theo định dạng MD5 theo cấu trúc: `StudentId|timestamp|chanelCode|secretKey` |
| `timestamp` | Timestamp có định dạng `yyyy-MM-dd HH:mm` và chuyển đổi sang đơn vị millisecond |

**Ví dụ:**

```json
{
    "channelCode": "DLC",
    "bills": {
        "code": "0d6a5f25-a110-49f4-8d40-6cfaa06668bf"
    },
    "studentId": "1234567890",
    "amount": "1000000",
    "checkSum": "bff8bf08250c435e236a44e62d2688b5",
    "timestamp": "1765419470000"
}
```

**Response:**

- **Khi tất cả các thông tin truyền vào hoàn toàn trung khớp** thì DSpace sẽ gạch nợ cho bạn đọc, đồng thời trả về thông báo "Payment success" với mã trạng thái `200`.
- **Khi có bất kì thông tin nào không chính xác** thì DSpace không tiến hành gạch nợ và trả về mã lỗi khác `200` cùng thông tin chi tiết về lỗi (ví dụ khi: số tiền không khớp, thông tin sinh viên không tồn tại,…).

### 3. Thông Tin Bảng Dữ Liệu Lưu ChannelCode Và SecretKey

**Tên bảng:** `payment_credential`

**Thông tin bảng dữ liệu:**

| STT | Tên cột | Kiểu dữ liệu | Chú thích |
|-----|---------|--------------|-----------|
| 1 | `id` | INT | Tự sinh, tăng dần khi insert dữ liệu |
| 2 | `name` | VARCHAR(255) | Không được rỗng |
| 3 | `channel_code` | VARCHAR(255) | Không được rỗng |
| 4 | `secret_key` | VARCHAR(255) | Không được rỗng |
| 5 | `active` | TINYINT | Giá trị true hoặc false |
| 6 | `host` | TEXT | Không được rỗng |

## Tài Liệu Tham Khảo

- [Next.js Documentation](https://nextjs.org/docs) - tìm hiểu về các tính năng và API của Next.js
- [Learn Next.js](https://nextjs.org/learn) - hướng dẫn tương tác về Next.js
