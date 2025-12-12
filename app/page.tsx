'use client';

import { usePaymentFormData, usePaymentUIState, usePaymentUISetters } from '@/store/payment-store';
import { useGetBill, usePayBill } from '@/hooks/use-payment-form';
import { Card } from '@/components/ui/card';
import { ERROR_CODES } from '@/lib/api/payment';
import { PaymentForm } from '@/components/forms/payment-form';
import { BillInfo } from '@/components/display/bill-info';

export default function PaymentPage() {
  const { channelCode, secretKey, studentId } = usePaymentFormData();
  const { error, success } = usePaymentUIState();
  const { setError, setSuccess, clearMessages } = usePaymentUISetters();
  
  const { data: billData, refetch: fetchBill, isFetching } = useGetBill();
  const { mutate: payBill, isPending: isPaying } = usePayBill();

  const handleError = (err: unknown) => {
    const error = err as { 
      code?: string; 
      message?: string; 
      response?: { data?: { message?: string; ResultCode?: string } };
    };
    const msg = error.message || '';
    const str = String(err);
    const errorJson = err && typeof err === 'object' ? JSON.stringify(err) : '';
    
    // Phát hiện lỗi CORS - ưu tiên kiểm tra message trước
    const hasCorsInMessage = [msg, str, errorJson].some(s => 
      s.includes('CORS') || s.includes('Access-Control') || s.includes('blocked by CORS policy')
    );
    const isCorsError = hasCorsInMessage || 
      error.code === 'ERR_FAILED' || 
      (error.code === 'ERR_NETWORK' && !error.response);
    
    if (isCorsError) {
      return 'Lỗi CORS: Server không cho phép truy cập từ domain này. Vui lòng kiểm tra cấu hình CORS trên server hoặc sử dụng proxy.';
    }
    
    if (error.code === 'ERR_NETWORK' || [msg, str].some(s => s.includes('Network Error') || s.includes('Failed to fetch'))) {
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet hoặc domain API có thể không khả dụng.';
    }
    
    if (error.response?.data?.ResultCode) {
      return `${ERROR_CODES[error.response.data.ResultCode] || 'Lỗi không xác định'} (Mã lỗi: ${error.response.data.ResultCode})`;
    }
    
    return error.response?.data?.message || msg || 'Có lỗi xảy ra. Vui lòng thử lại.';
  };

  const handleBillResponse = (data?: { ResultCode?: string }) => {
    if (!data) return;
    if (data.ResultCode === '00') {
      setSuccess('Lấy thông tin đơn hàng thành công');
    } else {
      const errorMsg = ERROR_CODES[data.ResultCode || ''] || 'Lỗi không xác định';
      setError(`${errorMsg} (Mã lỗi: ${data.ResultCode})`);
    }
  };

  const handleGetBill = async () => {
    if (!studentId || !channelCode || !secretKey) {
      setError('Vui lòng điền đầy đủ thông tin (Mã số sinh viên, Channel Code, Secret Key)');
      return;
    }
    clearMessages();
    try {
      const { data } = await fetchBill();
      handleBillResponse(data);
    } catch (err) {
      setError(handleError(err));
    }
  };


  const handlePayBill = () => {
    if (!billData?.Data) {
      setError('Vui lòng lấy thông tin đơn hàng trước');
      return;
    }

    clearMessages();

    payBill(
      {
        billId: billData.Data.Bills.Id,
        studentId: billData.Data.StudentId,
        amount: billData.Data.Bills.DebtAmount,
        studentName: billData.Data.StudentName,
        description: billData.Data.Bills.Description,
      },
      {
        onSuccess: (result) => {
          // Theo README: Khi tất cả thông tin trung khớp, DSpace trả về "Payment success" với mã 200
          setSuccess(result.status === 200 ? 'Thanh toán thành công! (Payment success)' : `Thanh toán thất bại: ${result.data}`);
        },
        onError: (err) => {
          setError(handleError(err));
        },
      }
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 sm:py-8 px-4 sm:px-6">
      <div className="container mx-auto space-y-6">
        {/* Payment Form */}
        <Card className="border-2 shadow-lg">
          <div className="px-6 pt-6 pb-4">
            <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Hướng dẫn:</strong> Điền Channel Code, Secret Key, Mã số sinh viên, sau đó nhấn &quot;Lấy thông tin đơn hàng&quot; để xem thông tin đơn hàng.
              </p>
            </div>
          </div>
          <PaymentForm
            onGetBill={handleGetBill}
            isFetching={isFetching}
            isPaying={isPaying}
            error={error}
            success={success}
          />
        </Card>

        {/* Bill Info */}
        {billData?.Data && (
          <BillInfo
            billData={billData.Data}
            onPay={handlePayBill}
            isPaying={isPaying}
          />
        )}
      </div>
    </div>
  );
}
