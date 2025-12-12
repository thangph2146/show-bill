import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { TEST_DATA } from '@/lib/constants/test-data';

interface PaymentState {
  // Form data - theo chuẩn test script
  channelCode: string;
  secretKey: string;
  studentId: string;
  
  // UI state
  error: string | null;
  success: string | null;
  
  // Actions - Form data
  setChannelCode: (code: string) => void;
  setSecretKey: (key: string) => void;
  setStudentId: (id: string) => void;
  
  // Actions - UI state
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  clearMessages: () => void;
  
  // Actions - Utility
  loadQuickData: () => void;
}

const initialState = {
  channelCode: TEST_DATA.channelCode,
  secretKey: TEST_DATA.secretKey,
  studentId: TEST_DATA.studentId,
  error: null,
  success: null,
};

export const usePaymentStore = create<PaymentState>((set) => ({
  ...initialState,
  
  // Form data setters
  setChannelCode: (code) => set({ channelCode: code }),
  setSecretKey: (key) => set({ secretKey: key }),
  setStudentId: (id) => set({ studentId: id }),
  
  // UI state setters
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  clearMessages: () => set({ error: null, success: null }),
  
  // Utility actions - theo chuẩn test script
  loadQuickData: () => set({
    channelCode: 'DLC', // Từ database: channel_code = 'DLC'
    secretKey: 'DLC@!2345', // Secret key từ database (payment_credential table)
    studentId: '030740240067', // StudentId từ Postman test
    error: null,
    success: null,
  }),
}));

// Selectors để tối ưu re-render - chỉ subscribe các giá trị cần thiết
// Sử dụng useShallow để tránh re-render không cần thiết và fix SSR issue
type PaymentFormData = Pick<PaymentState, 'channelCode' | 'secretKey' | 'studentId'>;
type PaymentFormSetters = Pick<PaymentState, 'setChannelCode' | 'setSecretKey' | 'setStudentId'>;
type PaymentUIState = Pick<PaymentState, 'error' | 'success'>;
type PaymentUISetters = Pick<PaymentState, 'setError' | 'setSuccess' | 'clearMessages'>;

// Cache selector functions để tránh infinite loop trong SSR
const selectFormData = (state: PaymentState): PaymentFormData => ({
  channelCode: state.channelCode,
  secretKey: state.secretKey,
  studentId: state.studentId,
});

const selectFormSetters = (state: PaymentState): PaymentFormSetters => ({
  setChannelCode: state.setChannelCode,
  setSecretKey: state.setSecretKey,
  setStudentId: state.setStudentId,
});

const selectUIState = (state: PaymentState): PaymentUIState => ({
  error: state.error,
  success: state.success,
});

const selectUISetters = (state: PaymentState): PaymentUISetters => ({
  setError: state.setError,
  setSuccess: state.setSuccess,
  clearMessages: state.clearMessages,
});

export const usePaymentFormData = (): PaymentFormData =>
  usePaymentStore(
    useShallow((state) => selectFormData(state))
  );

export const usePaymentFormSetters = (): PaymentFormSetters =>
  usePaymentStore(
    useShallow((state) => selectFormSetters(state))
  );

export const usePaymentUIState = (): PaymentUIState =>
  usePaymentStore(
    useShallow((state) => selectUIState(state))
  );

export const usePaymentUISetters = (): PaymentUISetters =>
  usePaymentStore(
    useShallow((state) => selectUISetters(state))
  );

