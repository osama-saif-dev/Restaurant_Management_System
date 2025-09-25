import { asyncHandler } from "../components/asyncHandler.js";
import Offer from "../models/offers.js";

export const getOffers = asyncHandler(async (req, res) => {
    const offers = await Offer.find({ endDate: { $gt: new Date() } });
    res.status(200).json({ status: 'success', offers });
});

