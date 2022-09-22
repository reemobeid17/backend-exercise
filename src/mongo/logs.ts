import { Schema, model } from "mongoose";
import Logs from "../models/logs";

const logsSchema = new Schema<Logs>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  successful: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
});

const Logs = model<Logs>("Logs", logsSchema);

export default Logs;
