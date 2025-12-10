'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl">
            Đã xảy ra lỗi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-2">
              Thông báo lỗi:
            </p>
            <p className="text-sm text-foreground">
              {error.message || 'Đã xảy ra lỗi không xác định'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Mã lỗi: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              size="lg"
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Button>
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="rounded-lg border bg-muted p-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Chi tiết lỗi (Development only)
              </summary>
              <pre className="mt-4 overflow-auto text-xs">
                {error.stack || JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

