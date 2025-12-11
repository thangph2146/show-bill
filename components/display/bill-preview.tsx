'use client';

interface BillData {
  StudentName: string;
  Bills: {
    Description: string;
    Id: string;
    DebtAmount: string;
    CreateDate: string;
  };
  StudentId: string;
}

interface BillPreviewProps {
  billData: BillData;
}

/**
 * Component hiển thị bill dạng printable (A4)
 * Sử dụng cho chức năng xem và in bill
 */
export function BillPreview({ billData }: BillPreviewProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(parseInt(amount));
  };

  return (
    <div className="print:p-8 print:bg-white print:text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">HÓA ĐƠN THANH TOÁN</h1>
          <p className="text-sm text-gray-600">Hệ thống thanh toán trực tuyến</p>
        </div>

        {/* Bill Info */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Mã đơn hàng</p>
              <p className="text-sm font-mono font-semibold">{billData.Bills.Id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase mb-1">Ngày tạo</p>
              <p className="text-sm font-semibold">{formatDate(billData.Bills.CreateDate)}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">Thông tin khách hàng</p>
            <div className="space-y-1">
              <p className="text-base font-semibold">{billData.StudentName}</p>
              <p className="text-sm text-gray-600">Mã số thẻ: {billData.StudentId}</p>
            </div>
          </div>
        </div>

        {/* Bill Details */}
        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <p className="text-xs text-gray-500 uppercase mb-3">Chi tiết đơn hàng</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">{billData.Bills.Description}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="flex justify-between items-center border-t-2 border-gray-300 pt-4 mb-6">
          <span className="text-lg font-semibold text-gray-800">Tổng tiền thanh toán:</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(billData.Bills.DebtAmount)}</span>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
          <p className="mt-1">Hóa đơn này có giá trị pháp lý</p>
        </div>
      </div>
    </div>
  );
}

