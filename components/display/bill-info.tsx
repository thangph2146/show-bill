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
import { useState } from 'react';
import { BillPreview } from './bill-preview';
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
  const [showBillPreview, setShowBillPreview] = useState(false);

  const formatDate = (timestamp: string) => new Date(parseInt(timestamp)).toLocaleString('vi-VN');
  const formatCurrency = (amount: string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(amount));
  const handlePrint = () => printBill(billData);
  const handleViewBill = () => setShowBillPreview(true);

  return (
    <Card className="border-2 shadow-xl hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader className="dark:from-primary/10 dark:to-primary/20 border-b">
        <CardTitle className="text-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Thông tin đơn hàng
            </span>
          </div>
          {isMock && (
            <span className="text-xs font-semibold px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full border border-yellow-200 dark:border-yellow-800 shadow-sm">
              Mẫu
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <FieldGroup className="space-y-5">
          {/* Student Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
              <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                Tên sinh viên
              </FieldLabel>
              <FieldContent>
                <p className="text-lg font-bold text-foreground">
                  {billData.StudentName}
                </p>
              </FieldContent>
            </Field>

            <Field className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
              <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                </div>
                Mã số thẻ
              </FieldLabel>
              <FieldContent>
                <p className="text-lg font-bold text-foreground font-mono">
                  {billData.StudentId}
                </p>
              </FieldContent>
            </Field>
          </div>

          {/* Amount - Highlight */}
          <Field className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/5 dark:from-primary/20 dark:via-primary/10 dark:to-primary/10 rounded-2xl border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20 dark:bg-primary/30">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              Số tiền thanh toán
            </FieldLabel>
            <FieldContent>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {formatCurrency(billData.Bills.DebtAmount)}
              </p>
            </FieldContent>
          </Field>

          {/* Bill Details */}
          <Field className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
            <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              Mô tả đơn hàng
            </FieldLabel>
            <FieldContent>
              <p className="text-base font-semibold text-foreground leading-relaxed">
                {billData.Bills.Description}
              </p>
            </FieldContent>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
              <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                </div>
                Ngày tạo
              </FieldLabel>
              <FieldContent>
                <p className="text-base font-semibold text-foreground">
                  {formatDate(billData.Bills.CreateDate)}
                </p>
              </FieldContent>
            </Field>

            <Field className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
              <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                </div>
                Bill ID
              </FieldLabel>
              <FieldContent>
                <p className="text-sm font-mono font-semibold text-foreground break-all bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {billData.Bills.Id}
                </p>
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>

        {/* Action Buttons */}
        {!isMock && (
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={onPay}
              disabled={isPaying}
              className="flex-1 h-14 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
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
              className="h-14 text-base font-semibold border-2 hover:bg-accent/50 transition-all duration-200"
              size="lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              Xem bill
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-14 text-base font-semibold border-2 hover:bg-accent/50 transition-all duration-200"
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
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Xem hóa đơn
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Xem chi tiết thông tin hóa đơn và có thể in ra
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(95vh-180px)]">
            <BillPreview billData={billData} />
          </div>
          <DialogFooter className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t">
            <Button
              onClick={handlePrint}
              className="h-11 px-6 font-semibold shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              <Printer className="mr-2 h-5 w-5" />
              In hóa đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

