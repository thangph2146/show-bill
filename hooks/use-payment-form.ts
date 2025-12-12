import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentFormSchema, type PaymentFormData } from '@/lib/schemas/payment-schema';
import { usePaymentFormData, usePaymentFormSetters } from '@/store/payment-store';
import { getBillInfo, payBill } from '@/lib/api/payment';

export function usePaymentForm() {
  const { channelCode, secretKey, studentId } = usePaymentFormData();
  const { setChannelCode, setSecretKey, setStudentId } = usePaymentFormSetters();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      channelCode,
      secretKey,
      studentId,
    },
    mode: 'onChange',
  });

  const isSyncingFromStore = useRef(false);
  const lastStoreValues = useRef({ channelCode, secretKey, studentId });
  const channelCodeValue = useWatch({ control: form.control, name: 'channelCode' });
  const secretKeyValue = useWatch({ control: form.control, name: 'secretKey' });
  const studentIdValue = useWatch({ control: form.control, name: 'studentId' });

  useEffect(() => {
    const current = { channelCode, secretKey, studentId };
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
  }, [channelCode, secretKey, studentId, form]);

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
    if (!isSyncingFromStore.current && studentIdValue !== studentId) {
      setStudentId(studentIdValue);
      lastStoreValues.current.studentId = studentIdValue;
    }
  }, [studentIdValue, studentId, setStudentId]);

  const resetForm = (values?: Partial<PaymentFormData>) => {
    form.reset({
      channelCode: values?.channelCode ?? channelCode,
      secretKey: values?.secretKey ?? secretKey,
      studentId: values?.studentId ?? studentId,
    });
  };

  return {
    form,
    resetForm,
  };
}

export function useGetBill() {
  const { studentId, channelCode, secretKey } = usePaymentFormData();

  return useQuery({
    queryKey: ['bill', studentId, channelCode],
    queryFn: () => {
      if (!studentId || !channelCode || !secretKey) {
        throw new Error('Thiếu thông tin cần thiết');
      }
      return getBillInfo(studentId, channelCode, secretKey);
    },
    enabled: false,
  });
}

export function usePayBill() {
  const { channelCode, secretKey } = usePaymentFormData();
  return useMutation({
    mutationFn: ({ billId, studentId, amount, studentName, description }: {
      billId: string; studentId: string; amount: string; studentName?: string; description?: string;
    }) => payBill(billId, studentId, amount, channelCode, secretKey, studentName, description),
  });
}

