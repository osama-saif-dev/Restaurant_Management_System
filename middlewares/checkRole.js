import CustomError from "../components/customErrors.js";

export default function checkRole(...allowedRoles) {
    return (req, res, next) => {
        const userRole = req.user.role; 
        if (!allowedRoles.includes(userRole)) {
            throw new CustomError('Access Denied: Insufficient Permissions', 403);
        }                    
        next();
    };
}
