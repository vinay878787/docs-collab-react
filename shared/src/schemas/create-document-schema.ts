import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be under 200 characters')
    .trim(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
