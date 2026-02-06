import { z } from 'zod';

export const cardSchema = z.object({
  en: z.string().min(1),
  uz: z.string().min(1),
  example: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal(''))
});

export const reviewSchema = z.object({
  cardId: z.string().min(1),
  typedAnswer: z.string().min(1),
  grade: z.number().int().min(0).max(5)
});
