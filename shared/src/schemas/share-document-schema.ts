import { z } from 'zod';

export const shareDocumentSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  permission: z.enum(['read', 'write']),
});

export type ShareDocumentInput = z.infer<typeof shareDocumentSchema>;
