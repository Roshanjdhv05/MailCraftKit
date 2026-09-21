import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address format');

export const sendEmailSchema = z.object({
  to: emailSchema,
  fromEmail: emailSchema.optional(),
  fromName: z.string().max(100).optional(),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  templateId: z.string().uuid().optional(),
  html: z.string().optional(),
  variables: z.record(z.string()).optional(),
}).refine(
  (data) => !!data.templateId || !!data.html,
  { message: 'Either templateId or raw HTML must be provided', path: ['html'] }
);

export const testEmailSchema = z.object({
  to: emailSchema,
  fromEmail: emailSchema.optional(),
  fromName: z.string().max(100).optional(),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  html: z.string().min(1, 'HTML content is required'),
  variables: z.record(z.string()).optional(),
});

export const previewEmailSchema = z.object({
  html: z.string().min(1, 'HTML content is required'),
  variables: z.record(z.string()).optional(),
});

export const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Template name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  html: z.string().min(1, 'HTML content is required'),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional().or(z.literal('')),
});

export const importHtmlSchema = z.object({
  html: z.string().min(1, 'HTML content is required'),
  name: z.string().min(1, 'Template name is required').optional(),
});
