import { z } from 'zod';

/**
 * Schema validation cho Payment Form
 */
export const paymentFormSchema = z.object({
  channelCode: z
    .string()
    .min(1, 'Channel Code là bắt buộc')
    .max(255, 'Channel Code không được vượt quá 255 ký tự'),
  secretKey: z
    .string()
    .min(1, 'Secret Key là bắt buộc')
    .max(255, 'Secret Key không được vượt quá 255 ký tự'),
  studentId: z
    .string()
    .min(1, 'Mã số sinh viên là bắt buộc')
    .max(50, 'Mã số sinh viên không được vượt quá 50 ký tự')
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

