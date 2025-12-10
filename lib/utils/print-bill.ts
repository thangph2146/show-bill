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

/**
 * Format date từ timestamp
 */
function formatDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format currency VND
 */
function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(parseInt(amount));
}

/**
 * Tạo HTML content cho print bill
 */
export function generatePrintContent(billData: BillData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hóa đơn thanh toán</title>
        <style>
          @media print {
            @page { margin: 1cm; }
            body { margin: 0; }
          }
          body {
            font-family: Arial, sans-serif;
            max-width: 672px;
            margin: 0 auto;
            padding: 32px;
            color: #000;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
          }
          .info-section {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
          }
          .value {
            font-size: 14px;
            font-weight: 600;
          }
          .customer-info {
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 20px;
          }
          .amount-section {
            border-top: 2px solid #333;
            padding-top: 20px;
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .amount-label {
            font-size: 18px;
            font-weight: 600;
          }
          .amount-value {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
          }
          .footer {
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN THANH TOÁN</h1>
          <p style="font-size: 12px; color: #666;">Hệ thống thanh toán trực tuyến</p>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <div>
              <div class="label">Mã đơn hàng</div>
              <div class="value" style="font-family: monospace;">${billData.Bills.Id}</div>
            </div>
            <div style="text-align: right;">
              <div class="label">Ngày tạo</div>
              <div class="value">${formatDate(billData.Bills.CreateDate)}</div>
            </div>
          </div>
        </div>

        <div class="customer-info">
          <div class="label">Thông tin khách hàng</div>
          <div style="margin-top: 8px;">
            <div class="value" style="font-size: 16px;">${billData.StudentName}</div>
            <div style="font-size: 13px; color: #666; margin-top: 4px;">Mã sinh viên: ${billData.StudentId}</div>
          </div>
        </div>

        <div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 15px 0; margin: 20px 0;">
          <div class="label">Chi tiết đơn hàng</div>
          <div style="margin-top: 8px; font-size: 14px; color: #333;">${billData.Bills.Description}</div>
        </div>

        <div class="amount-section">
          <span class="amount-label">Tổng tiền thanh toán:</span>
          <span class="amount-value">${formatCurrency(billData.Bills.DebtAmount)}</span>
        </div>

        <div class="footer">
          <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
          <p style="margin-top: 5px;">Hóa đơn này có giá trị pháp lý</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Print bill trong cửa sổ mới
 */
export function printBill(billData: BillData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const printContent = generatePrintContent(billData);

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

