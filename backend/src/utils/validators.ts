import { z } from 'zod';

// Password: 8-16 characters, must include at least one uppercase letter and one special character
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

export const nameValidation = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(20, 'Name must be at least 20 characters long')
  .max(60, 'Name cannot exceed 60 characters');

export const addressValidation = z
  .string({ required_error: 'Address is required' })
  .trim()
  .min(1, 'Address is required')
  .max(400, 'Address cannot exceed 400 characters');

export const emailValidation = z
  .string({ required_error: 'Email is required' })
  .trim()
  .email('Must be a valid email address');

export const passwordValidation = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be between 8 and 16 characters')
  .max(16, 'Password must be between 8 and 16 characters')
  .regex(
    passwordRegex,
    'Password must be 8-16 characters and include at least one uppercase letter and one special character'
  );

export const signupSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  address: addressValidation,
  password: passwordValidation,
});

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, 'Password is required'),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordValidation,
});

export const createUserSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  address: addressValidation,
  password: passwordValidation,
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER'], {
    errorMap: () => ({ message: 'Role must be ADMIN, USER, or STORE_OWNER' }),
  }),
});

export const createStoreSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  address: addressValidation,
  ownerId: z.string().uuid().optional().nullable(),
});

export const submitRatingSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
});
