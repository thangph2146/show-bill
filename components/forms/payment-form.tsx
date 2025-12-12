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
      <Field 
        key={key} 
        data-invalid={!!fieldError}
        className="group transition-all duration-200"
      >
        <FieldLabel 
          htmlFor={key} 
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Icon className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FieldLabel>
        <FieldContent>
          <div className="relative group/input">
            <Input
              id={key}
              {...register(key, { required: false })}
              type={type}
              placeholder={placeholder}
              className="h-12 pl-10 pr-4 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary border-2"
              aria-invalid={!!fieldError}
              autoComplete={key === 'secretKey' ? 'current-password' : key === 'studentId' ? 'username' : 'off'}
            />
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors group-focus-within/input:text-primary" />
          </div>
          {getDescription() && (
            <FieldDescription className="mt-1.5 text-xs text-muted-foreground">
              {getDescription()}
            </FieldDescription>
          )}
          <FieldError errors={fieldError ? [{ message: fieldError.message }] : undefined} />
        </FieldContent>
      </Field>
    );
  };

  return (
    <CardContent className="space-y-6 pt-6 pb-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FIELD_CONFIGS.filter(f => f.key !== 'studentId').map(renderField)}
          </div>
          <div className="sm:col-span-2">
            {FIELD_CONFIGS.filter(f => f.key === 'studentId').map(renderField)}
          </div>
        </FieldGroup>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="submit"
            disabled={isFetching || isPaying}
            size="lg"
            className="flex-1 h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang lấy thông tin...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
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
            className="h-12 text-base font-medium border-2 hover:bg-accent/50 transition-all duration-200"
          >
            <Zap className="mr-2 h-5 w-5" />
            Thêm dữ liệu nhanh
          </Button>
        </div>
      </form>

      {/* Alerts */}
      <div className="space-y-3">
        {error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in slide-in-from-top-2 border-2 border-destructive/50 shadow-md"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium ml-2">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="animate-in fade-in slide-in-from-top-2 border-2 border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 shadow-md">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertDescription className="font-medium text-green-800 dark:text-green-200 ml-2">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </CardContent>
  );
}

