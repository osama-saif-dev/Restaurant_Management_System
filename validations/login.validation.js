import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string({
        invalid_type_error: 'Field must be email',
        required_error: 'Email is required'
    })
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
        .min(8, { message: 'Password must have at least 8 charachters' })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
            message: 'Password must contain uppercase, lowercase and number'
        })
        .trim(),
});