'use client';

import { Hash, Calendar, User, FileText, DollarSign, CheckCircle2 } from 'lucide-react';

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
      <div className="max-w-2xl mx-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-8 sm:p-10 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="text-center border-b-2 border-primary/20 pb-6 mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            HÓA ĐƠN THANH TOÁN
          </h1>
          <p className="text-sm font-medium text-muted-foreground">Hệ thống thanh toán trực tuyến</p>
        </div>

        {/* Bill Info */}
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mã đơn hàng</p>
              </div>
              <p className="text-sm font-mono font-semibold text-foreground">{billData.Bills.Id}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 text-right sm:text-left">
              <div className="flex items-center justify-end sm:justify-start gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ngày tạo</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{formatDate(billData.Bills.CreateDate)}</p>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-primary" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Thông tin khách hàng</p>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-foreground">{billData.StudentName}</p>
              <p className="text-sm font-medium text-muted-foreground">Mã số thẻ: <span className="font-mono font-semibold text-foreground">{billData.StudentId}</span></p>
            </div>
          </div>
        </div>

        {/* Bill Details */}
        <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chi tiết đơn hàng</p>
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold text-foreground leading-relaxed">{billData.Bills.Description}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/5 dark:from-primary/20 dark:via-primary/10 dark:to-primary/10 rounded-2xl border-2 border-primary/30 shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-foreground">Tổng tiền thanh toán:</span>
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {formatCurrency(billData.Bills.DebtAmount)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-semibold text-foreground">Cảm ơn bạn đã sử dụng dịch vụ!</p>
          </div>
          <p className="text-xs text-muted-foreground">Hóa đơn này có giá trị pháp lý</p>
        </div>
      </div>
    </div>
  );
}

