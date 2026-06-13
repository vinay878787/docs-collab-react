import z from 'zod';

export const joinExistingDocumentSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  documentPin: z.string().min(1, 'Document PIN is required'),
});

export type joinExistingDocumentFormData = z.infer<
  typeof joinExistingDocumentSchema
>;
