import Table from "../models/Table.js";
import { asyncHandler } from "../components/asyncHandler.js";
import CustomError from "../components/customErrors.js";
import { schemaResponse } from "../components/schemaResponse.js";
import {
  createTableSchema,
  updateTableSchema,
} from "../validations/table.validation.js";


export const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity, location, image } = req.body;

  schemaResponse(createTableSchema, req.body);

  // Check for duplicate tableNumber
  const exists = await Table.findOne({ tableNumber });
  if (exists) {
    throw new CustomError("Table number already exists", 400);
  }

  const table = await Table.create({ tableNumber, capacity, location, image });
  res.status(201).json({ message: "Table created successfully", table });
});

export const getTables = asyncHandler(async (req, res) => {
  const tables = await Table.find().sort({ tableNumber: 1 }).lean();
  res.json({ count: tables.length, tables });
});

export const getTableById = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) throw new CustomError("Table not found", 404);
  res.json(table);
});

export const updateTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity, location, image } = req.body;

  schemaResponse(updateTableSchema, req.body);

  const table = await Table.findById(req.params.id);
  if (!table) throw new CustomError("Table not found", 404);

  // prevent duplicate tableNumber on update
  if (tableNumber && tableNumber !== table.tableNumber) {
    const dup = await Table.findOne({ tableNumber });
    if (dup) throw new CustomError("Table number already exists", 400);
  }

  table.tableNumber = tableNumber ?? table.tableNumber;
  table.capacity = capacity ?? table.capacity;
  table.location = location ?? table.location;
  table.image = image ?? table.image;

  await table.save();
  res.json({ message: "Table updated successfully", table });
});

export const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findByIdAndDelete(req.params.id);
  if (!table) throw new CustomError("Table not found", 404);
  res.json({ message: "Table deleted successfully" });
});
