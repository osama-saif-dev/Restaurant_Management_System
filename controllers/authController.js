import { asyncHandler } from "../components/asyncHandler.js";
import CustomError from "../components/customErrors.js";
import { signupSchema } from "../validations/signUp.validation.js";
import User from "../models/users.js";
import { schemaResponse } from "../components/schemaResponse.js";
import jwt from 'jsonwebtoken';
import { sendCode } from "../utils/sendCode.js";
import { forgotPasswordSchema } from "../validations/forgotPassword.validation.js";
import { loginSchema } from "../validations/login.validation.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { resetPasswordSchema } from "../validations/resetPassword.validation.js";
import { sendEmail } from "../utils/sendEmail.js";

// Sign Up
export const signup = asyncHandler(async (req, res) => {
    const { name, email, password, password_confirmation } = req.body;
    
    const validationData = schemaResponse(signupSchema, {
        name, email, password, password_confirmation
    });

    const existedUser = await User.findOne({ email });
    if (existedUser) throw new CustomError('Email already exists', 400, {
        email: ['Email already exists']
    });

    const user = await User.create({
        name: validationData.name,
        email: validationData.email,
        password: validationData.password
    });

    await sendCode(user);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_API_SECRET);

    res.status(201).json({ success: true, token, message: 'Sign Up Successfully, We sent you a verification code, Please Verify Your Email' });
});

// Resend Code
export const resendCode = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new CustomError('User Not Found', 401);

    await sendCode(user);
    res.status(200).json({ success: true, message: 'Send Code Successfully' });
});

// Verify Account
export const verifyCode = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code || code.length != 4)
        throw new CustomError('Code is required and must be exactly 4 characters', 400);

    const user = await User.findById(req.user._id);

    if (Date.now() > user.codeExpiresAt) {
        throw new CustomError('Verification code has expired', 400);
    }

    if (user.code != code) {
        throw new CustomError('Invalid verification code', 400);
    }

    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_API_SECRET);

    res.status(200).json({ success: true, message: 'Account verified successfully', token, user });
});

// Login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const validationData = schemaResponse(loginSchema, { email, password });
    if (!validationData)
        throw new CustomError('Validation Error');

    const user = await User.findOne({ email });
    if (!user)
        throw new CustomError('User not found', 404);

    const isCorretedPassword = await bcrypt.compare(password, user.password);
    if (!isCorretedPassword)
        throw new CustomError('Email or password is invalid', 400);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_API_SECRET);
    
    if (user && !user.isVerified) {
        await sendCode(user);
        return res.status(400).json({ success: false, message: 'We sent you a verification code, Please Verify Your Email', token })
    }

    res.status(200).json({ success: true, token, user })
});

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    //const validationData = 
    schemaResponse(forgotPasswordSchema, {email});
    // if (!validationData) throw new CustomError('Validation Error', 400);

    const existedUser = await User.findOne({ email });
    if (!existedUser) throw new CustomError('Email is invalid', 400);

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour  

    existedUser.resetPasswordToken = token;
    existedUser.resetPasswordExpires = expires;
    await existedUser.save();

    const link = `http://localhost:4200/reset-password?token=${token}`;
    await sendEmail({ 
        to: existedUser.email,
        subject: 'Reset password',
        text: link
    });

    res.status(200).json({ success: true, message: 'we sent link to your email, please check your email' });
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password, password_confirmation } = req.body;

    // const validationData =
    schemaResponse(resetPasswordSchema, { token, password, password_confirmation });
    // if (!validationData) throw new CustomError('Validation Error', 400);

    const user = await User.findOne({ 
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
     });

     if (!user) throw new CustomError('Invalid or expired token', 400);

     user.password = password;
     user.resetPasswordExpires = null;
     user.resetPasswordToken = null;

     await user.save();
     res.status(200).json({ success: true, message: 'Updated Password Successfully' });
});

// Contact Us
export const contactUs = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const { name, email } = req.user;

    if (!message || message.trim() === '') {
        throw new CustomError('Message Is Required', 400);
    }

    await sendEmail({
        to: process.env.EMAIL_USER,
        subject: 'New Contact Us Message',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    });

    res.status(200).json({ success: true, message: 'Message sent successfully' });
});
