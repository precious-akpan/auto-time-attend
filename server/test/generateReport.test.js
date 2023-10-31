// Test case 1: No data
const {generateReport} = require("../utils/generateReport.js")

test('generateReport should return zeros when no data is provided', () => {
    const data = [];
    const result = generateReport(data);

    expect(result.daysWorked).toBe(0);
    expect(result.hoursWorked).toBe(0);
    expect(result.daysOnBreak).toBe(0);
    expect(result.hoursOnBreak).toBe(0);
});

// Test case 2: Only clock-in and clock-out times
test('generateReport should calculate total days and hours worked correctly', () => {
    const data = [
        { clockIn: '2021-01-01T09:00:00', clockOut: '2021-01-01T17:00:00' },
        { clockIn: '2021-01-02T10:00:00', clockOut: '2021-01-02T18:00:00' },
    ];
    const result = generateReport(data);

    expect(result.daysWorked).toBe(2);
    expect(result.hoursWorked).toBe(16);
    expect(result.daysOnBreak).toBe(0);
    expect(result.hoursOnBreak).toBe(0);
});

// Test case 3: Only start-break and end-break times
test('generateReport should calculate total days and hours on break correctly', () => {
    const data = [
        { breakStart: '2021-01-01T12:00:00', breakEnd: '2021-01-01T13:00:00' },
        { breakStart: '2021-01-02T14:00:00', breakEnd: '2021-01-02T15:00:00' },
    ];
    const result = generateReport(data);

    expect(result.daysWorked).toBe(0);
    expect(result.hoursWorked).toBe(0);
    expect(result.hoursOnBreak).toBe(2);
});

// Test case 4: Both clock-in/clock-out and start-break/end-break times
test('generateReport should calculate total days and hours worked/on break correctly', () => {
    const data = [
        { clockIn: '2021-01-01T09:00:00', clockOut: '2021-01-01T17:00:00', breakStart: '2021-01-01T12:00:00', breakEnd: '2021-01-01T13:00:00' },
        { clockIn: '2021-01-02T10:00:00', clockOut: '2021-01-02T18:00:00', breakStart: '2021-01-02T14:00:00', breakEnd: '2021-01-02T15:00:00' },
    ];
    const result = generateReport(data);

    expect(result.daysWorked).toBe(2);
    expect(result.hoursWorked).toBe(16);
    expect(result.hoursOnBreak).toBe(2);
});