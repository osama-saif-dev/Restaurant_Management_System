import { z } from 'zod';

export const signupSchema = z.object({
    name: z.string({
        invalid_type_error: 'Field must be string',
        required_error: 'Name is required'
    })
        .min(1, { message: 'Name is required' })
        .trim(),

    email: z.string({
        invalid_type_error: 'Field must be email',
        required_error: 'Email is required'
    })
        .min(1, { message: 'Email is required' })
        .toLowerCase()
        .trim()
        .refine((email) => {
            const allwoedOrigin = ['.com', '.net', '.org', '.edu'];
            return allwoedOrigin.some((origin) => email.endsWith(origin))
        }, {
            message: 'Email must end with .com, .net, .org, or .edu'
        }),

    password: z.string({
        invalid_type_error: 'Field must be string',
        required_error: 'Password is required'
    })
        .min(1, { message: 'Password is required' })
        .min(8, { message: 'Password must have at least 8 charachters' })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
            message: 'Password must contain uppercase, lowercase and number'
        })
        .trim(),

    password_confirmation: z.string({
        invalid_type_error: 'Field must be string',
        required_error: 'Password confirmation is required'
    })
        .min(1, { message: 'Password confirmation is required' })
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