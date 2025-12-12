'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import {
  Search,
  User,
  Key,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Zap,
} from 'lucide-react';
import { usePaymentForm } from '@/hooks/use-payment-form';
import { usePaymentStore } from '@/store/payment-store';

interface PaymentFormProps {
  onGetBill: () => void;
  isFetching: boolean;
  isPaying: boolean;
  error: string | null;
  success: string | null;
}

type FieldKey = 'channelCode' | 'secretKey' | 'studentId';

interface FieldConfig {
  key: FieldKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  type?: 'text' | 'password';
  required?: boolean;
}

const FIELD_CONFIGS: FieldConfig[] = [
  {
    key: 'channelCode',
    label: 'Channel Code',
    icon: Building2,
    placeholder: 'DLC',
    required: true,
  },
  {
    key: 'secretKey',
    label: 'Secret Key',
    icon: Key,
    placeholder: 'DLC@!2345 (từ database payment_credential)',
    type: 'password',
    required: true,
  },
  {
    key: 'studentId',
    label: 'Mã số sinh viên',
    icon: User,
    placeholder: '030740240067',
    required: true,
  },
];

export function PaymentForm({
  onGetBill,
  isFetching,
  isPaying,
  error,
  success,
}: PaymentFormProps) {
  const { form } = usePaymentForm();
  const { register, handleSubmit, formState: { errors } } = form;
  const loadQuickData = usePaymentStore((state) => state.loadQuickData);

  const onSubmit = () => onGetBill();
  const handleLoadQuickData = () => loadQuickData();

  const renderField = (fieldConfig: FieldConfig) => {
    const { key, label, icon: Icon, placeholder, type = 'text', required } = fieldConfig;
    const fieldError = errors[key as keyof typeof errors];
    
    // Description cho các field
    const getDescription = () => {
      if (key === 'secretKey') {
        return 'Secret key từ bảng payment_credential trong database. Giá trị mặc định: DLC@!2345';
      }
      if (key === 'channelCode') {
        return 'Channel code từ bảng payment_credential. Giá trị mặc định: DLC';
      }
      if (key === 'studentId') {
        return 'Mã số sinh viên cần tra cứu hóa đơn';
      }
      return undefined;
    };
    
    return (
      <Field key={key} data-invalid={!!fieldError}>
        <FieldLabel htmlFor={key} className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </FieldLabel>
        <FieldContent>
          <Input
            id={key}
            {...register(key, { required: false })}
            type={type}
            placeholder={placeholder}
            className="h-11"
            aria-invalid={!!fieldError}
            autoComplete={key === 'secretKey' ? 'current-password' : key === 'studentId' ? 'username' : 'off'}
          />
          {getDescription() && (
            <FieldDescription>{getDescription()}</FieldDescription>
          )}
          <FieldError errors={fieldError ? [{ message: fieldError.message }] : undefined} />
        </FieldContent>
      </Field>
    );
  };

  return (
    <CardContent className="space-y-4 sm:space-y-5 pt-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELD_CONFIGS.map(renderField)}
          </div>
        </FieldGroup>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="submit"
            disabled={isFetching || isPaying}
            size="lg"
            className="flex-1"
          >
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lấy thông tin...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Lấy thông tin đơn hàng
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleLoadQuickData}
            disabled={isFetching || isPaying}
            variant="outline"
            size="lg"
          >
            <Zap className="mr-2 h-4 w-4" />
            Thêm dữ liệu nhanh
          </Button>
        </div>
      </form>

        {/* Alerts */}
        {error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in slide-in-from-top-2"
          >
            <AlertCircle className="h-6 w-6" />
            <AlertDescription className="font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="animate-in fade-in slide-in-from-top-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            <AlertDescription className="font-medium text-green-800 dark:text-green-200">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
  );
}

