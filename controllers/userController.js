import { asyncHandler } from "../components/asyncHandler.js";
import Offer from "../models/offers.js";
import Product from "../models/products.js";
import CustomError from "../components/customErrors.js";
import Review from "../models/review.js";
import User from "../models/users.js";
import Subcategory from "../models/subcategories.js";
import ApiFeatures from "../utils/apiFeatures.js";

// Offers
export const getOffers = asyncHandler(async (req, res) => {
    const currentDate = Date.now();
    const offers = await Product.find({ 
        offerId: { $exists: true, $ne: null }
     }).populate({
        path: 'offerId',
        match: { endDate: { $gt: currentDate } }
     });
    res.status(200).json({ status: 'success', productsOffers: offers });
});

// Product Details
export const productDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        throw new CustomError('Product not found', 404);
    }
    const similarProducts = await Product.find({ subcategoryId: product.subcategoryId, _id: { $ne: id } });
    res.status(200).json({ status: 'success', product, similarProducts });
});

// Create Review
export const createReview = asyncHandler(async (req, res) => {
    const user = req.user;
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
        throw new CustomError('All fields are required', 400);
    }
    const product = await Product.findById(productId);
    if (!product) {
        throw new CustomError('Product not found', 404);
    }
    const review = {
        userId: user._id,
        productId,
        rating,
        comment
    };
    await Review.create(review);
    res.status(200).json({ status: 'success', message: 'Review added successfully', review });
});

// Get Reviews
export const getReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).populate('userId');
    res.status(200).json({ status: 'success', reviews });
});

// Delete Review
export const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
        throw new CustomError('Review not found', 404);
    }
    res.status(200).json({ status: 'success', message: 'Review deleted successfully' });
});

// update Review
export const updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const user = req.user;

    if (!rating || !comment) {
        throw new CustomError('All fields are required', 400);
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        throw new CustomError('Review not found', 404);
    }

    if (review.userId.toString() !== user._id.toString()) {
        throw new CustomError('Not authorized to update this review', 403);
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.status(200).json({
        status: 'success',
        message: 'Review updated successfully',
        review,
    });
});

// Get Testimonials
export const getTestimonials = asyncHandler(async (req, res) => {
    const testimonials = await Review.find({
        rating: { $gte: 4 }
    }).populate('userId').populate('productId');
    res.status(200).json({ status: 'success', testimonials });
});

// Update Profile
export const updateProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    const { name } = req.body;
    if ((!name || name.trim() === '') && !req.file) {
        throw new CustomError('Data is required', 400);
    }
    if (name) {
        user.name = name;
    } else {
        user.image = req.file.path;
    }
    await user.save();
    res.status(200).json({ status: 'success', message: 'Profile updated successfully', user });
});

// Get All Products with Search, Filter, Sort, Pagination
export const getAllProducts = async (req, res) => {
  const features = new ApiFeatures(Product.find().populate("offerId"), req.query)
    .search()
    .filter()
    .sort();

  const totalProducts = await Product.countDocuments(features.query.getFilter());

  features.paginate();

  const products = await features.query;
  const limit = +req.query.limit || 10;
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    success: true,
    results: products.length,
    totalProducts,
    totalPages,
    products,
  });
};

// Get Subategories
export const getSubcategories = asyncHandler(async (req, res) => {
    const subcategories = await Subcategory.find();
    res.status(200).json({ status: 'success', subcategories });
});
