import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String,
      enum: ["indoor", "outdoor"],
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Table = mongoose.model("Table", tableSchema);
export default Table;
