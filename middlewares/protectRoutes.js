import { asyncHandler } from "../components/asyncHandler.js";
import User from "../models/users.js";
import CustomError from "../components/customErrors.js";
import jwt from 'jsonwebtoken';

export const protecteRoute = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        throw new CustomError('Unauthorized - Token is required', 401);

    const token = authHeader.split(' ')[1];

    if (!token)
        throw new CustomError('Unauthorization - Token is required', 401);

    const decoded = jwt.verify(token, process.env.JWT_API_SECRET);
    if (!decoded) throw new CustomError('Token is invalid', 401);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) throw new CustomError('User Not Found', 404);

    req.user = user;
    next();
});
