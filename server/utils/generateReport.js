const generateReport = (data) => {
  try {
    let totalDaysWorked = 0;
    let totalHoursWorked = 0;
    let totalDaysOnBreak = 0;
    let totalHoursOnBreak = 0;

    data.forEach((entry) => {
      const {clockIn, clockOut, breakStart, breakEnd} = entry;

      if (clockIn && clockOut) {
        const workDuration = new Date(clockOut) - new Date(clockIn);
        totalDaysWorked += Math.floor(workDuration / (1000 * 60 * 60 * 8));
        totalHoursWorked += Math.floor(workDuration / (1000 * 60 * 60));
      }

      if (breakStart && breakEnd) {
        const breakDuration = new Date(breakEnd) - new Date(breakStart);
        totalHoursOnBreak += Math.floor(breakDuration / (1000 * 60 * 60));
      }
    });

    return {
      daysWorked: totalDaysWorked,
      hoursWorked: totalHoursWorked,
      daysOnBreak: totalDaysOnBreak,
      hoursOnBreak: totalHoursOnBreak,
    };
  } catch (e) {
    console.log(e)
  }
};

module.exports = { generateReport };
