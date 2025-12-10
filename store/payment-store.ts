import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { TEST_DATA } from '@/lib/constants/test-data';

interface PaymentState {
  // Form data
  domain: string;
  endpoint: string;
  channelCode: string;
  secretKey: string;
  billId: string;
  studentId: string;
  
  // UI state
  error: string | null;
  success: string | null;
  activeTab: 'standard' | 'mock' | 'api-config';
  showBillPreview: boolean;
  
  // Actions - Form data
  setDomain: (domain: string) => void;
  setEndpoint: (endpoint: string) => void;
  setChannelCode: (code: string) => void;
  setSecretKey: (key: string) => void;
  setBillId: (id: string) => void;
  setStudentId: (id: string) => void;
  
  // Actions - UI state
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setActiveTab: (tab: 'standard' | 'mock' | 'api-config') => void;
  setShowBillPreview: (show: boolean) => void;
  clearMessages: () => void;
  
  // Actions - Utility
  loadTestData: () => void;
  loadQuickData: () => void;
  reset: () => void;
}

const initialState = {
  domain: 'https://tailieuso.hub.edu.vn',
  endpoint: '/ehub/payment/getbills',
  channelCode: TEST_DATA.channelCode,
  secretKey: TEST_DATA.secretKey,
  billId: TEST_DATA.billId,
  studentId: TEST_DATA.studentId,
  error: null,
  success: null,
  activeTab: 'standard' as const,
  showBillPreview: false,
};

export const usePaymentStore = create<PaymentState>((set) => ({
  ...initialState,
  
  // Form data setters
  setDomain: (domain) => set({ domain }),
  setEndpoint: (endpoint) => set({ endpoint }),
  setChannelCode: (code) => set({ channelCode: code }),
  setSecretKey: (key) => set({ secretKey: key }),
  setBillId: (id) => set({ billId: id }),
  setStudentId: (id) => set({ studentId: id }),
  
  // UI state setters
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setShowBillPreview: (showBillPreview) => set({ showBillPreview }),
  clearMessages: () => set({ error: null, success: null }),
  
  // Utility actions
  loadTestData: () => set({ ...TEST_DATA, error: null, success: null }),
  loadQuickData: () => set({
    channelCode: 'DLC',
    secretKey: 'DLC@!2345',
    billId: '28623f65-426a-41e8-ad29-cdfee1ddb9f5',
    studentId: '28623f65-426a-41e8-ad29-cdfee1ddb9f5',
    error: null,
    success: null,
  }),
  reset: () => set(initialState),
}));

// Selectors để tối ưu re-render - chỉ subscribe các giá trị cần thiết
// Sử dụng useShallow để tránh re-render không cần thiết và fix SSR issue
type PaymentFormData = Pick<PaymentState, 'domain' | 'endpoint' | 'channelCode' | 'secretKey' | 'billId' | 'studentId'>;
type PaymentFormSetters = Pick<PaymentState, 'setDomain' | 'setEndpoint' | 'setChannelCode' | 'setSecretKey' | 'setBillId' | 'setStudentId'>;
type PaymentUIState = Pick<PaymentState, 'error' | 'success' | 'activeTab' | 'showBillPreview'>;
type PaymentUISetters = Pick<PaymentState, 'setError' | 'setSuccess' | 'setActiveTab' | 'setShowBillPreview' | 'clearMessages'>;

// Cache selector functions để tránh infinite loop trong SSR
const selectFormData = (state: PaymentState): PaymentFormData => ({
  domain: state.domain,
  endpoint: state.endpoint,
  channelCode: state.channelCode,
  secretKey: state.secretKey,
  billId: state.billId,
  studentId: state.studentId,
});

const selectFormSetters = (state: PaymentState): PaymentFormSetters => ({
  setDomain: state.setDomain,
  setEndpoint: state.setEndpoint,
  setChannelCode: state.setChannelCode,
  setSecretKey: state.setSecretKey,
  setBillId: state.setBillId,
  setStudentId: state.setStudentId,
});

const selectUIState = (state: PaymentState): PaymentUIState => ({
  error: state.error,
  success: state.success,
  activeTab: state.activeTab,
  showBillPreview: state.showBillPreview,
});

const selectUISetters = (state: PaymentState): PaymentUISetters => ({
  setError: state.setError,
  setSuccess: state.setSuccess,
  setActiveTab: state.setActiveTab,
  setShowBillPreview: state.setShowBillPreview,
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

