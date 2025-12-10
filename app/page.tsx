'use client';

import { useState } from 'react';
import { usePaymentFormData, usePaymentUIState, usePaymentUISetters, usePaymentStore } from '@/store/payment-store';
import { useGetBill, useGetBills, usePayBill } from '@/hooks/use-payment-form';
import { Card, CardContent } from '@/components/ui/card';
import { ERROR_CODES } from '@/lib/api/payment';
import { FileText, Receipt, Settings } from 'lucide-react';
import { PaymentForm } from '@/components/forms/payment-form';
import { ApiConfigForm } from '@/components/forms/api-config-form';
import { BillInfo } from '@/components/display/bill-info';
import { MockBillInfo } from '@/components/display/mock-bill-info';
import { BillsList } from '@/components/display/bills-list';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { callDynamicApi, callApiFromTemplate } from '@/lib/api/dynamic-api';

export default function PaymentPage() {
  const { channelCode, secretKey, billId, studentId } = usePaymentFormData();
  const { error, success, activeTab } = usePaymentUIState();
  const { setError, setSuccess, setActiveTab, clearMessages } = usePaymentUISetters();
  const setBillId = usePaymentStore((state) => state.setBillId);
  
  const [selectedBillId, setSelectedBillId] = useState<string | undefined>();
  const [isCallingDynamicApi, setIsCallingDynamicApi] = useState(false);
  const [dynamicApiResponse, setDynamicApiResponse] = useState<unknown>(null);
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set(['channelCode', 'secretKey', 'studentId']));

  const { data: billsData, refetch: fetchBills, isFetching: isFetchingBills } = useGetBills();
  const { data: billData, refetch: fetchBill, isFetching } = useGetBill();
  const { mutate: payBill, isPending: isPaying } = usePayBill();

  const handleError = (err: unknown) => {
    const error = err as {
      code?: string;
      message?: string;
      response?: { data?: { message?: string } };
    };
    
    // CORS error
    if (error.message?.includes('CORS') || error.message?.includes('Access-Control')) {
      return 'Lỗi CORS: Server không cho phép truy cập từ domain này. Vui lòng kiểm tra cấu hình CORS trên server.';
    }
    
    // Network error
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet hoặc domain API có thể không khả dụng.';
    }
    
    return error.response?.data?.message || error.message || 'Có lỗi xảy ra';
  };

  const handleGetBills = async () => {
    if (!studentId || !channelCode || !secretKey) {
      setError('Vui lòng điền đầy đủ thông tin (Student ID, Channel Code, Secret Key)');
      return;
    }

    clearMessages();

    try {
      // Nếu có billId, gọi API getBillInfo để lấy thông tin đơn hàng cụ thể
      if (billId) {
        const { data } = await fetchBill();
        if (data?.ResultCode === '00') {
          setSuccess('Lấy thông tin đơn hàng thành công');
        } else {
          const errorMsg = ERROR_CODES[data?.ResultCode || ''] || 'Lỗi không xác định';
          setError(`Lỗi: ${errorMsg} (Code: ${data?.ResultCode})`);
        }
      } else {
        // Nếu không có billId, gọi API getBills để lấy danh sách đơn hàng
        const { data } = await fetchBills();
        if (data?.bills && data.bills.length > 0) {
          setSuccess(`Lấy danh sách đơn hàng thành công (${data.bills.length} đơn hàng)`);
        } else {
          setError('Không có đơn hàng nào');
        }
      }
    } catch (err) {
      setError(handleError(err));
    }
  };

  const handleSelectBill = async (billId: string) => {
    setSelectedBillId(billId);
    setBillId(billId);
    clearMessages();

    try {
      const { data } = await fetchBill();
      if (data?.ResultCode === '00') {
        setSuccess('Lấy thông tin đơn hàng thành công');
      } else {
        const errorMsg = ERROR_CODES[data?.ResultCode || ''] || 'Lỗi không xác định';
        setError(`Lỗi: ${errorMsg} (Code: ${data?.ResultCode})`);
      }
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
          setSuccess(result.status === 200 ? 'Thanh toán thành công!' : `Thanh toán thất bại: ${result.data}`);
        },
        onError: (err) => {
          setError(handleError(err));
        },
      }
    );
  };



  const handleTabChange = (value: string) => {
    setActiveTab(value as 'standard' | 'mock' | 'api-config');
  };

  const handleCallDynamicApi = async (config: {
    templateId?: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    baseUrl?: string;
    payload: Record<string, unknown>;
  }) => {
    clearMessages();
    setIsCallingDynamicApi(true);
    setDynamicApiResponse(null);

    try {
      // Merge form values vào payload
      const payload = {
        ...config.payload,
        channelCode: config.payload.channelCode || channelCode,
        studentId: config.payload.studentId || studentId,
        billId: config.payload.billId || billId,
      };

      let response;
      if (config.templateId) {
        // Gọi từ template
        response = await callApiFromTemplate(
          config.templateId,
          payload,
          secretKey,
          config.baseUrl
        );
      } else {
        // Gọi custom API
        response = await callDynamicApi({
          method: config.method,
          endpoint: config.endpoint,
          baseUrl: config.baseUrl,
          payload,
          secretKey,
        });
      }

      setDynamicApiResponse(response.data);
      setSuccess(`API call thành công! Status: ${response.status}`);

      // Nếu là getbills, tự động cập nhật billsData
      if (config.templateId === 'getbills' && response.data) {
        // Có thể cần transform response data
        // billsData sẽ được cập nhật tự động nếu response format đúng
      }
    } catch (err) {
      setError(handleError(err));
    } finally {
      setIsCallingDynamicApi(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 sm:py-8 px-4 sm:px-6">
      <div className="container mx-auto space-y-6">
        {/* Payment Form với Tabs */}
        <Card className="border-2 shadow-lg">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start gap-2">
              <TabsTrigger value="standard">
                <FileText className="mr-2 h-4 w-4" />
                Form chuẩn
              </TabsTrigger>
              <TabsTrigger value="api-config">
                <Settings className="mr-2 h-4 w-4" />
                API Config
              </TabsTrigger>
              <TabsTrigger value="mock">
                <Receipt className="mr-2 h-4 w-4" />
                Bill mẫu
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="mt-0">
              <div className="px-6 pt-6 pb-4">
                <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Hướng dẫn:</strong>{' '}
                    {(() => {
                      const fieldLabels: Record<string, string> = {
                        domain: 'Domain',
                        endpoint: 'Endpoint',
                        channelCode: 'Channel Code',
                        secretKey: 'Secret Key',
                        studentId: 'Student ID',
                        billId: 'Bill ID',
                      };
                      const requiredFields = ['channelCode', 'secretKey', 'studentId'];
                      const visibleRequiredFields = Array.from(visibleFields)
                        .filter((field) => requiredFields.includes(field))
                        .map((field) => fieldLabels[field] || field);
                      const visibleOptionalFields = Array.from(visibleFields)
                        .filter((field) => !requiredFields.includes(field))
                        .map((field) => fieldLabels[field] || field);
                      
                      let instruction = '';
                      if (visibleRequiredFields.length > 0) {
                        instruction = `Điền ${visibleRequiredFields.join(', ')}`;
                        if (visibleOptionalFields.length > 0) {
                          instruction += ` (và ${visibleOptionalFields.join(', ')} nếu cần)`;
                        }
                      } else {
                        instruction = 'Chọn các field cần thiết từ menu "Chọn các field hiển thị"';
                      }
                      
                      // Thêm hướng dẫn dựa trên có billId hay không
                      const hasBillId = visibleFields.has('billId');
                      if (hasBillId) {
                        instruction += '. Nếu có Bill ID, sẽ lấy thông tin đơn hàng cụ thể; nếu không, sẽ lấy danh sách đơn hàng.';
                      } else {
                        instruction += ', sau đó nhấn "Lấy danh sách đơn hàng" để xem các đơn hàng của bạn.';
                      }
                      return instruction;
                    })()}
                  </p>
                </div>
              </div>
              <PaymentForm
                onGetBill={handleGetBills}
                isFetching={isFetchingBills || isFetching}
                isPaying={isPaying}
                error={error}
                success={success}
                showBillId={!!selectedBillId}
                onVisibleFieldsChange={setVisibleFields}
              />
            </TabsContent>

            <TabsContent value="api-config" className="mt-0">
              <div className="px-6 pt-6 pb-4">
                <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>API Config:</strong> Chọn API mẫu hoặc tự config endpoint, method, payload để test API động. Có thể gọi danh sách và thanh toán.
                  </p>
                </div>
              </div>
              <ApiConfigForm
                onCallApi={handleCallDynamicApi}
                isCalling={isCallingDynamicApi}
                secretKey={secretKey}
                defaultValues={{
                  channelCode,
                  studentId,
                  billId,
                }}
              />
              {dynamicApiResponse !== null && (
                <div className="px-6 pb-6">
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4">Response:</h3>
                      <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md overflow-auto text-xs">
                        {JSON.stringify(dynamicApiResponse as Record<string, unknown>, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mock" className="mt-0">
              <div className="px-6 pt-6 pb-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Bill mẫu:</strong> Hiển thị danh sách đơn hàng mẫu từ dummy data. Chọn một đơn hàng để xem chi tiết và in bill. Không gọi API.
          </p>
        </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Bills List - Hiển thị danh sách đơn hàng */}
        {activeTab === 'standard' && billsData?.bills && billsData.bills.length > 0 && (
          <BillsList
            bills={billsData.bills}
            onSelectBill={handleSelectBill}
            selectedBillId={selectedBillId}
          />
        )}

        {/* Bill Info - Hiển thị thông tin chi tiết bill đã chọn */}
        {activeTab === 'standard' && billData?.Data && (
          <BillInfo
            billData={billData.Data}
            onPay={handlePayBill}
            isPaying={isPaying}
          />
        )}

        {/* Mock Bill Info */}
        {activeTab === 'mock' && <MockBillInfo />}
        </div>
    </div>
  );
}
