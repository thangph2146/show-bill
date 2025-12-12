import { NextRequest, NextResponse } from 'next/server';
import { proxyApiRequest } from '@/lib/api/proxy-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.channelCode || !body.studentId || !body.checkSum || !body.timestamp || !body.bills || !body.amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const response = await proxyApiRequest('https://tailieuso.hub.edu.vn/ehub/payment/callback', body);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: unknown) {
    const err = error as { response?: { data: unknown; status: number }; message?: string };
    if (err.response) {
      return NextResponse.json(err.response.data, { status: err.response.status });
    }
    return NextResponse.json({ error: err.message || 'Network error' }, { status: 500 });
  }
}

