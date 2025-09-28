import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";
import CustomError from "../components/customErrors.js";
import { asyncHandler } from "../components/asyncHandler.js";
import { schemaResponse } from "../components/schemaResponse.js";
import { createReservationSchema } from "../validations/reservation.validation.js";

// Grace period in hours for user cancellations
const CANCEL_GRACE_HOURS = 2;

/**
 * @desc   List my reservations
 * @route  GET /api/reservations/me
 * @access User
 */
export const listMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user.id })
    .populate("table", "number location capacity image")
    .sort({ startTime: 1 });
  res.json(reservations);
});

/**
 * @desc   Create a new reservation
 * @route  POST /api/reservations
 * @access User | Admin
 */
export const createReservation = asyncHandler(async (req, res) => {
  const { tableId, startTime, endTime, name, phone, notes } = req.body;
  const userId = req.user.id;

  schemaResponse(createReservationSchema, req.body);

  const table = await Table.findById(tableId);
  if (!table) throw new CustomError("Table not found", 404);

  const sTime = new Date(startTime);
  const eTime = new Date(endTime);
  if (eTime <= sTime)
    throw new CustomError("End time must be after start time", 400);

  // Conflict check
  const overlap = await Reservation.findOne({
    table: tableId,
    status: { $in: ["pending", "confirmed", "reserved"] },
    $or: [{ startTime: { $lt: eTime }, endTime: { $gt: sTime } }],
  });
  if (overlap) throw new CustomError("Time slot already booked", 409);

  const reservation = await Reservation.create({
    table: tableId,
    user: userId,
    name,
    phone,
    notes,
    startTime: sTime,
    endTime: eTime,
    status: "pending",
    auditLog: [{ action: "created", by: userId }],
  });

  res.status(201).json({ message: "Reservation created", reservation });
});

/**
 * @desc   Cancel a reservation
 * @route  PATCH /api/reservations/:id/cancel
 * @access User | Admin
 */
export const cancelReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  const reservation = await Reservation.findById(id);
  if (!reservation) throw new CustomError("Reservation not found", 404);
  if (reservation.status === "cancelled")
    throw new CustomError("Already cancelled", 400);

  // Check permission & grace period
  if (!isAdmin && reservation.user.toString() !== userId) {
    throw new CustomError("Not authorized", 403);
  }
  if (!isAdmin) {
    const cutoff = new Date(reservation.startTime);
    cutoff.setHours(cutoff.getHours() - CANCEL_GRACE_HOURS);
    if (new Date() > cutoff) {
      throw new CustomError(
        `Cannot cancel less than ${CANCEL_GRACE_HOURS} hours before`,
        400
      );
    }
  }

  // Workflow check
  if (!Reservation.isValidTransition(reservation.status, "cancelled")) {
    throw new CustomError(
      `Cannot change status from ${reservation.status} to cancelled`,
      400
    );
  }

  reservation.status = "cancelled";
  reservation.auditLog.push({ action: "cancelled", by: userId });
  await reservation.save();

  res.status(200).json({ message: "Reservation cancelled", reservation });
});

/**
 * @desc   List all reservations
 * @route  GET /api/reservations
 * @access  Admin
 */
export const listAllReservations = asyncHandler(async (_req, res) => {
  const reservations = await Reservation.find()
    .populate("table", "tableNumber location capacity image")
    .populate("user", "name email")
    .sort({ startTime: 1 });
  res.status(200).json(reservations);
});

/**
 * @desc   Update reservation status (Admin)
 * @route  PATCH /api/reservations/:id/status
 * @access Admin
 */
export const updateReservationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const adminId = req.user.id;

  const reservation = await Reservation.findById(id);
  if (!reservation) throw new CustomError("Reservation not found", 404);

  if (!Reservation.isValidTransition(reservation.status, status)) {
    throw new CustomError(
      `Cannot change status from ${reservation.status} to ${status}`,
      400
    );
  }

  reservation.status = status;
  reservation.auditLog.push({ action: `status:${status}`, by: adminId });
  await reservation.save();

  res.status(200).json({ message: "Reservation status updated", reservation });
});
