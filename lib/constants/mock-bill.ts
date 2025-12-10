/**
 * Mock Bill Data để hiển thị trước
 * Dựa trên response mẫu từ tài liệu API
 */
export const MOCK_BILL_DATA = {
  StudentName: 'Nguyễn Văn A',
  Bills: {
    Description: 'Thanh toán phí dịch vụ thư viện số - Tài liệu học tập',
    Id: '0d6a5f25-a110-49f4-8d40-6cfaa06668bf',
    DebtAmount: '1000000',
    CreateDate: Date.now().toString(),
  },
  StudentId: '1951012345',
};

/**
 * Mock Bills List - Danh sách đơn hàng mẫu
 * Dùng cho tab "Bill mẫu" để demo flow: get bills → chọn bill → xem chi tiết
 */
export const MOCK_BILLS_LIST = [
  {
    billId: '0d6a5f25-a110-49f4-8d40-6cfaa06668bf',
    description: 'Thanh toán phí dịch vụ thư viện số - Tài liệu học tập',
    createDate: Date.now().toString(),
    customerId: '1951012345',
    customerName: 'Nguyễn Văn A',
    amount: '1000000',
    checkSum: 'mock-checksum-1',
  },
  {
    billId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    description: 'Thanh toán phí dịch vụ thư viện số - Tài liệu nghiên cứu',
    createDate: (Date.now() - 86400000).toString(), // 1 ngày trước
    customerId: '1951012345',
    customerName: 'Nguyễn Văn A',
    amount: '500000',
    checkSum: 'mock-checksum-2',
  },
  {
    billId: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    description: 'Thanh toán phí dịch vụ thư viện số - Tài liệu tham khảo',
    createDate: (Date.now() - 172800000).toString(), // 2 ngày trước
    customerId: '1951012345',
    customerName: 'Nguyễn Văn A',
    amount: '750000',
    checkSum: 'mock-checksum-3',
  },
];

/**
 * Map từ billId sang MOCK_BILL_DATA format
 */
export const MOCK_BILLS_MAP: Record<string, typeof MOCK_BILL_DATA> = {
  '0d6a5f25-a110-49f4-8d40-6cfaa06668bf': {
    StudentName: 'Nguyễn Văn A',
    Bills: {
      Description: 'Thanh toán phí dịch vụ thư viện số - Tài liệu học tập',
      Id: '0d6a5f25-a110-49f4-8d40-6cfaa06668bf',
      DebtAmount: '1000000',
      CreateDate: Date.now().toString(),
    },
    StudentId: '1951012345',
  },
  '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p': {
    StudentName: 'Nguyễn Văn A',
    Bills: {
      Description: 'Thanh toán phí dịch vụ thư viện số - Tài liệu nghiên cứu',
      Id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
      DebtAmount: '500000',
      CreateDate: (Date.now() - 86400000).toString(),
    },
    StudentId: '1951012345',
  },
  '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q': {
    StudentName: 'Nguyễn Văn A',
    Bills: {
      Description: 'Thanh toán phí dịch vụ thư viện số - Tài liệu tham khảo',
      Id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
      DebtAmount: '750000',
      CreateDate: (Date.now() - 172800000).toString(),
    },
    StudentId: '1951012345',
  },
};

/**
 * Dummy data cho Payment Form
 */
export const DUMMY_FORM_DATA = {
  channelCode: 'DLC',
  secretKey: 'your-secret-key-here',
  billId: '0d6a5f25-a110-49f4-8d40-6cfaa06668bf',
  studentId: '1951012345',
};

