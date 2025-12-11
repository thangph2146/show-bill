'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
} from '@/components/ui/field';
import {
  FileText,
  User,
  Hash,
  DollarSign,
  Calendar,
  CreditCard,
  Loader2,
  Receipt,
  Eye,
  Printer,
} from 'lucide-react';
import { BillPreview } from './bill-preview';
import { usePaymentUIState, usePaymentUISetters } from '@/store/payment-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { printBill } from '@/lib/utils/print-bill';

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

interface BillInfoProps {
  billData: BillData;
  onPay: () => void;
  isPaying: boolean;
  isMock?: boolean;
}

export function BillInfo({ billData, onPay, isPaying, isMock = false }: BillInfoProps) {
  const { showBillPreview } = usePaymentUIState();
  const { setShowBillPreview } = usePaymentUISetters();

  const formatDate = (timestamp: string) => new Date(parseInt(timestamp)).toLocaleString('vi-VN');
  const formatCurrency = (amount: string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(amount));
  const handlePrint = () => printBill(billData);
  const handleViewBill = () => setShowBillPreview(true);

  return (
    <Card className="border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Thông tin đơn hàng
          </div>
          {isMock && (
            <span className="text-xs font-medium px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md border border-yellow-200 dark:border-yellow-800">
              Mẫu
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <FieldGroup>
          {/* Student Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
              <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <User className="h-3 w-3" />
                Tên sinh viên
              </FieldLabel>
              <FieldContent>
                <p className="text-base font-semibold text-foreground">
                  {billData.StudentName}
                </p>
              </FieldContent>
            </Field>

            <Field className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
              <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Hash className="h-3 w-3" />
                Mã số thẻ
              </FieldLabel>
              <FieldContent>
                <p className="text-base font-semibold text-foreground">
                  {billData.StudentId}
                </p>
              </FieldContent>
            </Field>
          </div>

          {/* Amount - Highlight */}
          <Field className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
            <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4" />
              Số tiền thanh toán
            </FieldLabel>
            <FieldContent>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(billData.Bills.DebtAmount)}
              </p>
            </FieldContent>
          </Field>

          {/* Bill Details */}
          <Field className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
            <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Mô tả đơn hàng
            </FieldLabel>
            <FieldContent>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {billData.Bills.Description}
              </p>
            </FieldContent>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
              <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Ngày tạo
              </FieldLabel>
              <FieldContent>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(billData.Bills.CreateDate)}
                </p>
              </FieldContent>
            </Field>

            <Field className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
              <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Hash className="h-3 w-3" />
                Bill ID
              </FieldLabel>
              <FieldContent>
                <p className="text-xs font-mono text-foreground break-all">
                  {billData.Bills.Id}
                </p>
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>

        {/* Action Buttons */}
        {!isMock && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={onPay}
              disabled={isPaying}
              className="flex-1 h-12 text-base font-semibold"
              size="lg"
            >
              {isPaying ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý thanh toán...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Thanh toán ngay
                </>
              )}
            </Button>
            <Button
              onClick={handleViewBill}
              variant="outline"
              className="h-12 text-base font-medium"
              size="lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              Xem bill
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-12 text-base font-medium"
              size="lg"
            >
              <Printer className="mr-2 h-5 w-5" />
              In bill
            </Button>
          </div>
        )}
        
        {isMock && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="flex-1 p-4 bg-muted/50 rounded-lg border border-dashed text-center">
              <p className="text-sm text-muted-foreground">
                Đây là dữ liệu mẫu để xem trước giao diện
              </p>
            </div>
            <Button
              onClick={handleViewBill}
              variant="outline"
              className="h-12 text-base font-medium"
              size="lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              Xem bill
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-12 text-base font-medium"
              size="lg"
            >
              <Printer className="mr-2 h-5 w-5" />
              In bill
            </Button>
          </div>
        )}
      </CardContent>

      {/* Bill Preview Dialog */}
      <Dialog open={showBillPreview} onOpenChange={setShowBillPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Xem hóa đơn</DialogTitle>
            <DialogDescription>
              Xem chi tiết thông tin hóa đơn và có thể in ra
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <BillPreview billData={billData} />
          </div>
          <DialogFooter>
            <Button
              onClick={handlePrint}
              variant="outline"
            >
              <Printer className="mr-2 h-4 w-4" />
              In bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

