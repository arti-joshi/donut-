const mongoose = require("mongoose");
const { Schema, SchemaTypes } = mongoose;

// types Schema
const types_model = new Schema({
  type: { type: String, required: true },
  color: { type: String, required: true },
});

// Transactions Schema
const transaction_model = new Schema({
  name: { type: SchemaTypes.String, required: true },
  category: { type: SchemaTypes.String, ref: "categories", required: true }, // Reference to Category
  type: {
    type: SchemaTypes.String,
    required: true,
    enum: ["Expense", "Savings", "Investment"],
  },
  amount: { type: SchemaTypes.Number, required: true, min: 0 },
  date_time: { type: SchemaTypes.Date, default: Date.now, required: true },
});

const Types = mongoose.model("types", types_model);
const Transaction = mongoose.model("transaction", transaction_model);

module.exports = {
  Types,
  Transaction,
};
