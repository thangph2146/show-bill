import { z } from 'zod';

/**
 * Schema validation cho Payment Form
 */
export const paymentFormSchema = z.object({
  domain: z
    .string()
    .max(500, 'Domain không được vượt quá 500 ký tự')
    .optional(),
  endpoint: z
    .string()
    .max(500, 'Endpoint không được vượt quá 500 ký tự')
    .optional(),
  channelCode: z
    .string()
    .min(1, 'Channel Code là bắt buộc')
    .max(255, 'Channel Code không được vượt quá 255 ký tự'),
  secretKey: z
    .string()
    .min(1, 'Secret Key là bắt buộc')
    .max(255, 'Secret Key không được vượt quá 255 ký tự'),
  billId: z
    .string()
    .max(500, 'Bill ID không được vượt quá 500 ký tự')
    .optional(),
  studentId: z
    .string()
    .min(1, 'Student ID là bắt buộc')
    .max(50, 'Student ID không được vượt quá 50 ký tự')
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

