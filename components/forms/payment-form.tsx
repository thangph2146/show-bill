'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Settings2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { usePaymentForm } from '@/hooks/use-payment-form';
import { usePaymentStore } from '@/store/payment-store';
import { cn } from '@/lib/utils';

interface PaymentFormProps {
  onGetBill: () => void;
  isFetching: boolean;
  isPaying: boolean;
  error: string | null;
  success: string | null;
  onVisibleFieldsChange?: (fields: Set<FieldKey>) => void;
}

type FieldKey = 'channelCode' | 'secretKey' | 'studentId';

interface FieldConfig {
  key: FieldKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  type?: 'text' | 'password';
  required?: boolean;
  defaultVisible?: boolean;
}

const FIELD_CONFIGS: FieldConfig[] = [
  {
    key: 'channelCode',
    label: 'Channel Code',
    icon: Building2,
    placeholder: 'DLC',
    required: true,
    defaultVisible: true,
  },
  {
    key: 'secretKey',
    label: 'Secret Key',
    icon: Key,
    placeholder: 'DLC@!2345 (từ database payment_credential)',
    type: 'password',
    required: true,
    defaultVisible: true,
  },
  {
    key: 'studentId',
    label: 'Mã số sinh viên',
    icon: User,
    placeholder: '030740240067',
    required: true,
    defaultVisible: true,
  },
];

export function PaymentForm({
  onGetBill,
  isFetching,
  isPaying,
  error,
  success,
  onVisibleFieldsChange,
}: PaymentFormProps) {
  const { form } = usePaymentForm();
  const { register, handleSubmit, formState: { errors } } = form;
  const loadQuickData = usePaymentStore((state) => state.loadQuickData);

  // State cho các field được chọn - khởi tạo với giá trị mặc định
  const [visibleFields, setVisibleFields] = useState<Set<FieldKey>>(() => {
    const defaultFields = new Set<FieldKey>();
    FIELD_CONFIGS.forEach((field) => {
      if (field.defaultVisible) {
        defaultFields.add(field.key);
      }
    });
    return defaultFields;
  });

  const onSubmit = () => onGetBill();
  const handleLoadQuickData = () => loadQuickData();

  const toggleField = (fieldKey: FieldKey) => {
    setVisibleFields((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey);
      } else {
        newSet.add(fieldKey);
      }
      return newSet;
    });
  };

  // Notify parent when visibleFields change (sau khi render xong)
  useEffect(() => {
    if (onVisibleFieldsChange) {
      onVisibleFieldsChange(visibleFields);
    }
  }, [visibleFields, onVisibleFieldsChange]);

  const renderField = (fieldConfig: FieldConfig) => {
    const { key, label, icon: Icon, placeholder, type = 'text', required } = fieldConfig;
    if (!visibleFields.has(key)) return null;
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
          {/* Field Selector */}
          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Chọn các field hiển thị
            </FieldLabel>
            <FieldContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2" suppressHydrationWarning>
                      <Settings2 className="h-4 w-4" />
                      Đã chọn {visibleFields.size} field
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <div className="space-y-1">
                    {FIELD_CONFIGS.map((fieldConfig) => {
                      const isSelected = visibleFields.has(fieldConfig.key);
                      const Icon = fieldConfig.icon;
                      return (
                        <button
                          key={fieldConfig.key}
                          type="button"
                          onClick={() => toggleField(fieldConfig.key)}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm hover:bg-accent transition-colors',
                            isSelected && 'bg-accent'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-4 w-4 items-center justify-center rounded-sm border',
                              isSelected
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-input'
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <Icon className="h-4 w-4" />
                          <span>{fieldConfig.label}</span>
                          {fieldConfig.required && (
                            <span className="text-destructive text-xs ml-auto">*</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </FieldContent>
          </Field>

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
                Lấy danh sách đơn hàng
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

