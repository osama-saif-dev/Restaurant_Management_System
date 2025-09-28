import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',    
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'Product',
        required: true
    }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;