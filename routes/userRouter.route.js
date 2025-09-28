import express from "express";
import { getOffers } from "../controllers/userController.js";
import { createReview, getReviews, deleteReview, updateReview, updateProfile } from "../controllers/userController.js";
import { protecteRoute } from "../middlewares/protectRoutes.js";
import upload from "../libs/uploads.js";

const router = express.Router();
router.use(protecteRoute);

// Profile
router.put('/update-profile', upload.single('image'), updateProfile);

// Offers
router.get('/offers', getOffers);

// Reviews 
router.post('/create-review', createReview);
router.get('/get-reviews/:productId', getReviews);
router.delete('/delete-review/:reviewId', deleteReview);
router.put('/update-review/:reviewId', updateReview);

export default router;