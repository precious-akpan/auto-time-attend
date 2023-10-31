const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subSchema = new Schema(
  {
    clockIn: String,
    clockOut: String,
    breakStart: String,
    breakEnd: String,
  },
  { _id: false, immutable: true },
);

const employeeSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    sex: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    password: { type: String, required: true },
    timeAttendance: [subSchema, { default: {} }],
    admin: { type: Boolean, required: true, default: false },
    createdBy: {
      type: Schema.Types.ObjectId,
      immutable: true,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Employee", employeeSchema);
