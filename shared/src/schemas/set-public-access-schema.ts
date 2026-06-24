import { z } from 'zod';

export const setPublicAccessSchema = z.object({
  enabled: z.boolean(),
  permission: z.enum(['read', 'write']),
});

export type SetPublicAccessInput = z.infer<typeof setPublicAccessSchema>;
