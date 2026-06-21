import { z } from 'zod';

export const googleSignInSchema = z.object({
  accessToken: z.string().min(1, 'Google access token is required'),
});

export type GoogleSignInData = z.infer<typeof googleSignInSchema>;
