import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date, 
        required: true
    },
    discountPercentage: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;