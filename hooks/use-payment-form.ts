import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentFormSchema, type PaymentFormData } from '@/lib/schemas/payment-schema';
import { usePaymentFormData, usePaymentFormSetters } from '@/store/payment-store';
import { getBillInfo, getBills, payBill } from '@/lib/api/payment';

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

  const isSyncingFromStore = useRef(false);
  const lastStoreValues = useRef({ domain, endpoint, channelCode, secretKey, billId, studentId });
  const domainValue = useWatch({ control: form.control, name: 'domain' });
  const endpointValue = useWatch({ control: form.control, name: 'endpoint' });
  const channelCodeValue = useWatch({ control: form.control, name: 'channelCode' });
  const secretKeyValue = useWatch({ control: form.control, name: 'secretKey' });
  const billIdValue = useWatch({ control: form.control, name: 'billId' });
  const studentIdValue = useWatch({ control: form.control, name: 'studentId' });

  useEffect(() => {
    const current = { domain: domain || '', endpoint: endpoint || '', channelCode, secretKey, billId: billId || '', studentId };
    const changed = Object.keys(current).some(key => lastStoreValues.current[key as keyof typeof current] !== current[key as keyof typeof current]);
    if (changed) {
      const formValues = form.getValues();
      const shouldReset = Object.keys(current).some(key => (formValues[key as keyof typeof formValues] || '') !== current[key as keyof typeof current]);
      if (shouldReset) {
        isSyncingFromStore.current = true;
        form.reset(current);
        lastStoreValues.current = current;
        setTimeout(() => { isSyncingFromStore.current = false; }, 0);
      } else {
        lastStoreValues.current = current;
      }
    }
  }, [domain, endpoint, channelCode, secretKey, billId, studentId, form]);

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
    if (!isSyncingFromStore.current && billIdValue && billIdValue !== billId) {
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
    if (!isSyncingFromStore.current && (domainValue || '') !== domain) {
      setDomain(domainValue || '');
      lastStoreValues.current.domain = domainValue || '';
    }
  }, [domainValue, domain, setDomain]);

  useEffect(() => {
    if (!isSyncingFromStore.current && (endpointValue || '') !== endpoint) {
      setEndpoint(endpointValue || '');
      lastStoreValues.current.endpoint = endpointValue || '';
    }
  }, [endpointValue, endpoint, setEndpoint]);

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

export function useGetBills() {
  const { studentId, channelCode, secretKey, domain, endpoint } = usePaymentFormData();
  return useQuery({
    queryKey: ['bills', studentId, channelCode, domain, endpoint],
    queryFn: () => {
      if (!studentId || !channelCode || !secretKey) throw new Error('Thiếu thông tin cần thiết');
      return getBills(studentId, channelCode, secretKey, domain, endpoint);
    },
    enabled: false,
  });
}

export function usePayBill() {
  const { channelCode, secretKey, domain, endpoint, billId: defaultBillId } = usePaymentFormData();
  return useMutation({
    mutationFn: ({ billId, studentId, amount, studentName, description }: {
      billId: string; studentId: string; amount: string; studentName?: string; description?: string;
    }) => payBill(billId, studentId, amount, channelCode, secretKey, studentName, description, domain, endpoint, defaultBillId && defaultBillId !== billId ? { billId: defaultBillId } : undefined),
  });
}

