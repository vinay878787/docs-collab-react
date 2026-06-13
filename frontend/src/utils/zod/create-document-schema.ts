import { z } from 'zod';
export const createDocumentSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  title: z.string().min(1, 'Document Title is required'),
});

export type createDocumentFormData = z.infer<typeof createDocumentSchema>;
