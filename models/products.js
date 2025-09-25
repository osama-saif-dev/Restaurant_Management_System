import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true
    },
    image: {
        type: [String],
        required: true
    },
    sizes: {
        type: [String],
        enum: ['small', 'medium', 'large'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    },
    discountedPrice: {
        type: Number
    },
    quantity: {
        type: Number,
        default: 1
    }  
}, { timestamps: true });

const Product = mongoose.model('product', productSchema);
export default Product;