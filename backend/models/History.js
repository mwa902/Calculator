import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  expression: { type: String, required: true },
  result: { type: String, required: true },
  operation: { type: String, required: true },
  valueA: { type: Number, required: true },
  valueB: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

export default mongoose.model("History", historySchema);
