'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings,
  Globe,
  Loader2,
  AlertCircle,
  Play,
} from 'lucide-react';
import { HttpMethod } from '@/lib/config/api-templates';

interface ApiConfigFormProps {
  onCallApi: (config: {
    templateId?: string;
    method: HttpMethod;
    endpoint: string;
    baseUrl?: string;
    payload: Record<string, unknown>;
  }) => void;
  isCalling?: boolean;
  secretKey?: string;
  defaultValues?: {
    channelCode?: string;
    studentId?: string;
    billId?: string;
  };
}

export function ApiConfigForm({
  onCallApi,
  isCalling = false,
  defaultValues,
}: ApiConfigFormProps) {
  const [method, setMethod] = useState<HttpMethod>('POST');
  const [endpoint, setEndpoint] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [payloadJson, setPayloadJson] = useState('{}');
  const [error, setError] = useState<string | null>(null);

  const handleCallApi = () => {
    setError(null);

    try {
      // Parse JSON payload
      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(payloadJson);
      } catch {
        setError('Payload JSON không hợp lệ');
        return;
      }

      if (!endpoint) {
        setError('Vui lòng nhập endpoint');
        return;
      }

      // Merge default values nếu có
      if (defaultValues) {
        payload = {
          ...payload,
          channelCode: payload.channelCode || defaultValues.channelCode,
          studentId: payload.studentId || defaultValues.studentId,
          billId: payload.billId || defaultValues.billId,
        };
      }

      onCallApi({
        method,
        endpoint,
        baseUrl: baseUrl || undefined,
        payload,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Cấu hình API
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="method">Method</FieldLabel>
            <FieldContent>
              <Select value={method} onValueChange={(value) => setMethod(value as HttpMethod)}>
                <SelectTrigger id="method" className="w-full">
                  <SelectValue placeholder="Chọn method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="baseUrl">
              <Globe className="h-4 w-4 inline mr-2" />
              Base URL (tùy chọn)
            </FieldLabel>
            <FieldContent>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://tailieuso.hub.edu.vn"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Để trống sẽ dùng mặc định
              </p>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="endpoint">Endpoint</FieldLabel>
            <FieldContent>
              <Input
                id="endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/ehub/payment/getbills"
                required
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="payload">Request Payload (JSON)</FieldLabel>
            <FieldContent>
              <textarea
                id="payload"
                className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                value={payloadJson}
                onChange={(e) => setPayloadJson(e.target.value)}
                placeholder='{"channelCode": "DLC", "studentId": "1234567890"}'
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nhập payload dạng JSON. Các giá trị từ form chuẩn (channelCode, studentId, billId) sẽ được tự động merge nếu không có trong payload.
              </p>
            </FieldContent>
          </Field>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleCallApi}
              disabled={isCalling}
              className="flex-1"
            >
              {isCalling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gọi API...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Gọi API
                </>
              )}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

