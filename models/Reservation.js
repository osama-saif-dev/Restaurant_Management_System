import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // created | cancelled
  by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
});

const reservationSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "pending", // Reservation requested but not yet confirmed by staff/admin
        "confirmed", // Staff/admin has approved the reservation
        "reserved", // Reservation is locked in and waiting for the customer to arrive
        "seated", // Customer has arrived and is seated
        "cancelled", // Reservation was cancelled by user or admin
        "no_show", // Customer did not arrive at the scheduled time
      ],
      default: "pending",
    },
    auditLog: [auditLogSchema],
  },
  { timestamps: true }
);

// Static method to validate workflow transitions
reservationSchema.statics.isValidTransition = function (from, to) {
  const flow = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["reserved", "cancelled"],
    reserved: ["seated", "cancelled", "no_show"],
    seated: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
    no_show: [],
  };
  return flow[from]?.includes(to);
};

export default mongoose.model("Reservation", reservationSchema);
