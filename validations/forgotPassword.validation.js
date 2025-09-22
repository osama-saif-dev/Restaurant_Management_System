import { z } from 'zod';

export const forgotPasswordSchema = z.object({
    email: z.string({
        invalid_type_error: 'Field must be email',
        required_error: 'Email is required'
    })
        .toLowerCase()
        .trim()
        .refine((email) => {
            const allowedOrigin = ['.com', '.net', '.org', '.edu'];
            return allowedOrigin.some((origin) => email.endsWith(origin))
        }, {
            message: 'Email must end with .com, .net, .org, or .edu'
        }),
});