import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentFormSchema, type PaymentFormData } from '@/lib/schemas/payment-schema';
import { usePaymentFormData, usePaymentFormSetters } from '@/store/payment-store';
import { getBillInfo, getBills, payBill } from '@/lib/api/payment';

/**
 * Custom hook để quản lý Payment Form với React Hook Form
 * Sử dụng selectors để tối ưu re-render
 */
export function usePaymentForm() {
  const { domain, endpoint, channelCode, secretKey, billId, studentId } = usePaymentFormData();
  const { setDomain, setEndpoint, setChannelCode, setSecretKey, setBillId, setStudentId } = usePaymentFormSetters();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      domain,
      endpoint,
      channelCode,
      secretKey,
      billId,
      studentId,
    },
    mode: 'onChange',
  });

  // Ref để track xem có đang sync từ store không (tránh infinite loop)
  const isSyncingFromStore = useRef(false);
  const lastStoreValues = useRef({ domain, endpoint, channelCode, secretKey, billId, studentId });

  // Sync form values với store khi form values thay đổi
  const domainValue = useWatch({ control: form.control, name: 'domain' });
  const endpointValue = useWatch({ control: form.control, name: 'endpoint' });
  const channelCodeValue = useWatch({ control: form.control, name: 'channelCode' });
  const secretKeyValue = useWatch({ control: form.control, name: 'secretKey' });
  const billIdValue = useWatch({ control: form.control, name: 'billId' });
  const studentIdValue = useWatch({ control: form.control, name: 'studentId' });

  // Sync form với store khi store thay đổi từ bên ngoài (ví dụ: loadQuickData)
  // Chỉ reset khi store values thực sự thay đổi và khác với form values
  useEffect(() => {
    const currentBillId = billId || '';
    const currentEndpoint = endpoint || '';
    const currentDomain = domain || '';
    const storeChanged =
      lastStoreValues.current.domain !== currentDomain ||
      lastStoreValues.current.endpoint !== currentEndpoint ||
      lastStoreValues.current.channelCode !== channelCode ||
      lastStoreValues.current.secretKey !== secretKey ||
      lastStoreValues.current.billId !== currentBillId ||
      lastStoreValues.current.studentId !== studentId;

    if (storeChanged) {
      const currentValues = form.getValues();
      const formBillId = currentValues.billId || '';
      const formEndpoint = currentValues.endpoint || '';
      const formDomain = currentValues.domain || '';
      const shouldReset =
        formDomain !== currentDomain ||
        formEndpoint !== currentEndpoint ||
        currentValues.channelCode !== channelCode ||
        currentValues.secretKey !== secretKey ||
        formBillId !== currentBillId ||
        currentValues.studentId !== studentId;

      if (shouldReset) {
        isSyncingFromStore.current = true;
        form.reset({
          domain: currentDomain,
          endpoint: currentEndpoint,
          channelCode,
          secretKey,
          billId: currentBillId,
          studentId,
        });
        lastStoreValues.current = { domain: currentDomain, endpoint: currentEndpoint, channelCode, secretKey, billId: currentBillId, studentId };
        // Reset flag sau khi form đã được reset
        setTimeout(() => {
          isSyncingFromStore.current = false;
        }, 0);
      } else {
        lastStoreValues.current = { domain: currentDomain, endpoint: currentEndpoint, channelCode, secretKey, billId: currentBillId, studentId };
      }
    }
  }, [domain, endpoint, channelCode, secretKey, billId, studentId, form]);

  // Update store khi form values thay đổi (chỉ khi không phải đang sync từ store)
  useEffect(() => {
    if (!isSyncingFromStore.current && channelCodeValue !== channelCode) {
      setChannelCode(channelCodeValue);
      lastStoreValues.current.channelCode = channelCodeValue;
    }
  }, [channelCodeValue, channelCode, setChannelCode]);

  useEffect(() => {
    if (!isSyncingFromStore.current && secretKeyValue !== secretKey) {
      setSecretKey(secretKeyValue);
      lastStoreValues.current.secretKey = secretKeyValue;
    }
  }, [secretKeyValue, secretKey, setSecretKey]);

  useEffect(() => {
    if (!isSyncingFromStore.current && billIdValue !== billId && billIdValue) {
      setBillId(billIdValue);
      lastStoreValues.current.billId = billIdValue;
    }
  }, [billIdValue, billId, setBillId]);

  useEffect(() => {
    if (!isSyncingFromStore.current && studentIdValue !== studentId) {
      setStudentId(studentIdValue);
      lastStoreValues.current.studentId = studentIdValue;
    }
  }, [studentIdValue, studentId, setStudentId]);

  useEffect(() => {
    if (!isSyncingFromStore.current && domainValue !== domain) {
      setDomain(domainValue || '');
      lastStoreValues.current.domain = domainValue || '';
    }
  }, [domainValue, domain, setDomain]);

  useEffect(() => {
    if (!isSyncingFromStore.current && endpointValue !== endpoint) {
      setEndpoint(endpointValue || '');
      lastStoreValues.current.endpoint = endpointValue || '';
    }
  }, [endpointValue, endpoint, setEndpoint]);

  // Reset form với values từ store
  const resetForm = (values?: Partial<PaymentFormData>) => {
    form.reset({
      domain: values?.domain ?? (domain || ''),
      endpoint: values?.endpoint ?? (endpoint || ''),
      channelCode: values?.channelCode ?? channelCode,
      secretKey: values?.secretKey ?? secretKey,
      billId: values?.billId ?? (billId || ''),
      studentId: values?.studentId ?? studentId,
    });
  };

  return {
    form,
    resetForm,
  };
}

/**
 * Hook để lấy thông tin đơn hàng (getBillInfo API)
 */
export function useGetBill() {
  const { billId, studentId, channelCode, secretKey, domain, endpoint } = usePaymentFormData();

  return useQuery({
    queryKey: ['bill', billId, studentId, channelCode, domain, endpoint],
    queryFn: () => {
      if (!billId || !studentId || !channelCode || !secretKey) {
        throw new Error('Thiếu thông tin cần thiết');
      }
      return getBillInfo(billId, studentId, channelCode, secretKey, domain, endpoint);
    },
    enabled: false,
  });
}

/**
 * Hook để lấy danh sách đơn hàng (getbills API)
 */
export function useGetBills() {
  const { studentId, channelCode, secretKey, domain, endpoint } = usePaymentFormData();

  return useQuery({
    queryKey: ['bills', studentId, channelCode, domain, endpoint],
    queryFn: () => {
      if (!studentId || !channelCode || !secretKey) {
        throw new Error('Thiếu thông tin cần thiết');
      }
      
      // getBills API không cần billId trong payload
      // Nếu có billId, nên gọi getBillInfo thay vì getBills
      return getBills(studentId, channelCode, secretKey, domain, endpoint);
    },
    enabled: false,
  });
}

/**
 * Hook để thanh toán đơn hàng (payBill API)
 */
export function usePayBill() {
  const { channelCode, secretKey, domain, endpoint, billId: defaultBillId } = usePaymentFormData();

  return useMutation({
    mutationFn: ({
      billId,
      studentId,
      amount,
      studentName,
      description,
    }: {
      billId: string;
      studentId: string;
      amount: string;
      studentName?: string;
      description?: string;
    }) => {
      const additionalFields: Record<string, unknown> = {};
      if (defaultBillId && defaultBillId !== billId) {
        additionalFields.billId = defaultBillId;
      }
      
      return payBill(
        billId,
        studentId,
        amount,
        channelCode,
        secretKey,
        studentName,
        description,
        domain,
        endpoint,
        additionalFields
      );
    },
  });
}

