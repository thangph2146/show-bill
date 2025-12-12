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
    <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hóa đơn thanh toán - ${billData.Bills.Id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 1.5cm;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
          
          body {
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            max-width: 21cm;
            margin: 0 auto;
            padding: 40px;
            color: #1e293b;
            background: #ffffff;
            line-height: 1.6;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 24px;
            margin-bottom: 32px;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
          }
          
          .header h1 {
            font-size: 32px;
            font-weight: 800;
            margin: 12px 0 8px;
            color: #1e40af;
            letter-spacing: 1px;
          }
          
          .header p {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          
          .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
          }
          
          .info-card .label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }
          
          .info-card .value {
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
          }
          
          .info-card .value.mono {
            font-family: 'Courier New', monospace;
            font-size: 14px;
          }
          
          .customer-section {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 32px;
          }
          
          .customer-section .label {
            font-size: 10px;
            color: #3b82f6;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
          }
          
          .customer-section .name {
            font-size: 20px;
            font-weight: 800;
            color: #1e40af;
            margin-bottom: 6px;
          }
          
          .customer-section .id {
            font-size: 14px;
            color: #475569;
            font-weight: 600;
          }
          
          .customer-section .id code {
            font-family: 'Courier New', monospace;
            background: #ffffff;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
          }
          
          .details-section {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 32px;
          }
          
          .details-section .label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
          }
          
          .details-section .description {
            font-size: 15px;
            color: #1e293b;
            font-weight: 600;
            line-height: 1.8;
          }
          
          .amount-section {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 3px solid #3b82f6;
            border-radius: 16px;
            padding: 28px;
            margin-bottom: 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .amount-label {
            font-size: 20px;
            font-weight: 700;
            color: #1e40af;
          }
          
          .amount-value {
            font-size: 36px;
            font-weight: 900;
            color: #1e40af;
            letter-spacing: -0.5px;
          }
          
          .footer {
            border-top: 2px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 32px;
            text-align: center;
          }
          
          .footer p {
            font-size: 12px;
            color: #64748b;
            margin: 4px 0;
          }
          
          .footer .thank-you {
            font-weight: 700;
            color: #3b82f6;
            font-size: 13px;
          }
          
          .footer .legal {
            font-size: 11px;
            color: #94a3b8;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN THANH TOÁN</h1>
          <p>Hệ thống thanh toán trực tuyến</p>
        </div>
        
        <div class="info-grid">
          <div class="info-card">
            <div class="label">Mã đơn hàng</div>
            <div class="value mono">${billData.Bills.Id}</div>
          </div>
          <div class="info-card" style="text-align: right;">
            <div class="label">Ngày tạo</div>
            <div class="value">${formatDate(billData.Bills.CreateDate)}</div>
          </div>
        </div>

        <div class="customer-section">
          <div class="label">Thông tin khách hàng</div>
          <div class="name">${billData.StudentName}</div>
          <div class="id">Mã số thẻ: <code>${billData.StudentId}</code></div>
        </div>

        <div class="details-section">
          <div class="label">Chi tiết đơn hàng</div>
          <div class="description">${billData.Bills.Description}</div>
        </div>

        <div class="amount-section">
          <span class="amount-label">Tổng tiền thanh toán:</span>
          <span class="amount-value">${formatCurrency(billData.Bills.DebtAmount)}</span>
        </div>

        <div class="footer">
          <p class="thank-you">✓ Cảm ơn bạn đã sử dụng dịch vụ!</p>
          <p class="legal">Hóa đơn này có giá trị pháp lý</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Print bill trong cửa sổ mới
 */
export function printBill(billData: BillData): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt popup của trình duyệt.');
    return;
  }

  const printContent = generatePrintContent(billData);

  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Đợi content load xong trước khi print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Đóng cửa sổ sau khi print (người dùng có thể cancel)
      setTimeout(() => {
        printWindow.close();
      }, 100);
    }, 500);
  };
  
  // Fallback nếu onload không fire
  setTimeout(() => {
    if (printWindow.document.readyState === 'complete') {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 100);
    }
  }, 1000);
}

