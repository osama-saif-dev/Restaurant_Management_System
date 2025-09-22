import { z } from 'zod';

export const resetPasswordSchema = z.object({
    token: z.string({
        invalid_type_error: 'Token must be string',
        required_error: 'Token is required'
    })
        .trim(),

    password: z.string({
        invalid_type_error: 'Field must be string',
        required_error: 'Password is required'
    })
        .min(8, { message: 'Password must have at least 8 charachters' })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
            message: 'Password must contain uppercase, lowercase and number'
        })
        .trim(),

    password_confirmation: z.string({
        invalid_type_error: 'Field must be string',
        required_error: 'Password confirmation is required'
    })
        .min(8, { message: 'Password confirmation must have at least 8 charachters' })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
            message: 'Password must contain uppercase, lowercase and number'
        })
        .trim(),
})
    .refine((data) => data.password === data.password_confirmation, {
        path: ['password'],
        message: 'Passwords do not match'
    });