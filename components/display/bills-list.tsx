'use client';

import { Receipt, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { DataTable, Column } from '@/components/blocks/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Bill {
  billId: string;
  description: string;
  createDate: string;
  customerId: string;
  customerName: string;
  amount: string;
  checkSum: string;
}

interface BillsListProps {
  bills: Bill[];
  onSelectBill: (billId: string) => void;
  selectedBillId?: string;
}

export function BillsList({ bills, onSelectBill, selectedBillId }: BillsListProps) {
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

  const columns: Column<Bill>[] = [
    {
      id: 'billId',
      header: (
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Mã đơn hàng
        </div>
      ),
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-foreground">
            {row.billId.slice(0, 8)}...
          </code>
          {selectedBillId === row.billId && (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          )}
        </div>
      ),
      className: 'w-[200px]',
    },
    {
      id: 'description',
      header: 'Mô tả',
      accessor: (row) => (
        <p className="text-sm font-medium text-foreground max-w-md">
          {row.description}
        </p>
      ),
      className: 'min-w-[300px]',
    },
    {
      id: 'createDate',
      header: (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Ngày tạo
        </div>
      ),
      accessor: (row) => (
        <p className="text-sm text-foreground">{formatDate(row.createDate)}</p>
      ),
      className: 'w-[180px]',
    },
    {
      id: 'amount',
      header: (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Số tiền
        </div>
      ),
      accessor: (row) => (
        <p className="text-sm font-bold text-primary">{formatCurrency(row.amount)}</p>
      ),
      className: 'w-[150px]',
    },
  ];

  return (
    <Card className="border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Danh sách đơn hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <DataTable
          data={bills}
          columns={columns}
          onRowClick={(row) => onSelectBill(row.billId)}
          selectedRowId={selectedBillId}
          getRowId={(row) => row.billId}
          emptyMessage="Không có đơn hàng nào"
        />
      </CardContent>
    </Card>
  );
}

