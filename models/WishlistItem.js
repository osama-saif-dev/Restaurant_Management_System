import mongoose from "mongoose";

const WishlistItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// prevent duplicate (user, product) pairs
WishlistItemSchema.index({ user: 1, product: 1 }, { unique: true });

const WishlistItem = mongoose.model("WishlistItem", WishlistItemSchema);

export default WishlistItem;
