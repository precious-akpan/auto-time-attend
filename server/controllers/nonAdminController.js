const Employee = require("../models/employee.model");

exports.clockIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    const today = new Date().getDate();
    const lastClockInDate = employee.timeAttendance
      .at(-1)
      ?.clockIn?.replace(/,/g, "");
    const lastClockInDay = new Date(lastClockInDate)?.getDate();

    if (!employee.timeAttendance.at(-1) || lastClockInDay !== today) {
      employee.timeAttendance.push({ clockIn: new Date().toString() });
      await employee.save();
      res.status(200).json({ message: "Clock in successful." });
    } else if (lastClockInDay === today) {
      res.status(200).json({ message: "Already clocked in" });
    }
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: "Clock in failed." });
  }
};
exports.clockOut = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found.");
    }

    const lastAttendance = employee.timeAttendance.at(-1);
    if (lastAttendance.breakStart && !lastAttendance.breakEnd) {
      lastAttendance.breakEnd = new Date().toString();
      await employee.save();
    }

    if (lastAttendance.clockIn && !lastAttendance.clockOut) {
      lastAttendance.clockOut = new Date().toString();
      await employee.save();
      res.status(200).json({ message: "Clock out successful." });
    } else {
      res.status(200).json({ message: "Already clocked out." });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: "Clock out failed." });
  }
};
exports.startBreak = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found.");
    }

    const { clockIn, clockOut, breakStart } = employee.timeAttendance.at(-1);
    const currentTime = new Date();

    if (clockIn && !clockOut && clockIn < currentTime && !breakStart) {
      employee.timeAttendance.at(-1).breakStart = currentTime;
      await employee.save();
      res.status(200).json({ message: "Break start successful." });
    } else if (clockOut) {
      res.status(200).json({ message: "Cannot start break after clock-out." });
    } else if (breakStart) {
      res.status(200).json({ message: "Break already started." });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: "Break start failed." });
  }
};
exports.endBreak = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    const clockIn = employee.timeAttendance.at(-1)?.clockIn;
    const clockOut = employee.timeAttendance.at(-1)?.clockOut;
    const breakStart = employee.timeAttendance.at(-1)?.breakStart;
    const breakEnd = employee.timeAttendance.at(-1)?.breakEnd;
    const currentTime = new Date();

    if (clockIn && !clockOut && clockIn < currentTime && breakStart && !breakEnd) {
      employee.timeAttendance.at(-1).breakEnd= currentTime;
      await employee.save();
      res.status(200).json({ message: "Break ended successfully." });
    } else if (clockOut && !breakStart) {
      res.status(200).json({ message: "Cannot end break after clock-out." });
    } else if (breakEnd) {
      res.status(200).json({ message: "Break already ended." });
    } else if (!breakStart) {
        res.status(200).json({ message: "Failed. You must start break before you can end it." });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: "Break end failed." });
  }
};
