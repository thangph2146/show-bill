'use client';

import { useState } from 'react';
import { BillInfo } from './bill-info';
import { BillsList } from './bills-list';
import { MOCK_BILLS_LIST, MOCK_BILLS_MAP } from '@/lib/constants/mock-bill';

/**
 * Component hiển thị bill mẫu (dummy data) để demo/preview
 * Flow: Hiển thị danh sách bills → Chọn bill → Xem chi tiết → In bill
 * Không gọi API, chỉ sử dụng dummy data
 */
export function MockBillInfo() {
  const [selectedBillId, setSelectedBillId] = useState<string | undefined>();

  const handleSelectBill = (billId: string) => {
    setSelectedBillId(billId);
  };

  const handleMockPay = () => {};

  const selectedBillData = selectedBillId ? MOCK_BILLS_MAP[selectedBillId] : null;

  return (
    <>
      {/* Bills List - Hiển thị danh sách đơn hàng mẫu */}
      <BillsList
        bills={MOCK_BILLS_LIST}
        onSelectBill={handleSelectBill}
        selectedBillId={selectedBillId}
      />

      {/* Bill Info - Hiển thị thông tin chi tiết bill đã chọn */}
      {selectedBillData && (
        <BillInfo
          billData={selectedBillData}
          onPay={handleMockPay}
          isPaying={false}
          isMock={true}
        />
      )}
    </>
  );
}

