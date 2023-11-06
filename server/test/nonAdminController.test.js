jest.mock("../models/employee.model");
const Employee = require("../models/employee.model");
const {
  clockIn,
  startBreak,
  clockOut,
  endBreak,
} = require("../controllers/nonAdminController");
const { describe } = require("@jest/globals");
afterEach(() => {
  jest.resetAllMocks()
  Employee.mockReset()
});

describe("startBreak", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { employeeId: "<employee_id>" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it("should start break if employee is found and clocked in", async () => {
    const employee = {
      timeAttendance: [{ clockIn: new Date() }],
      save: jest.fn().mockReturnThis(),
    };
    Employee.findById = jest.fn().mockResolvedValue(employee);

    await startBreak(req, res, next);
    expect(Employee.findById).toHaveBeenCalledWith("<employee_id>");
    expect(employee.timeAttendance.at(-1).breakStart).toBeDefined();
    expect(employee.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Break start successful.",
    });
  });

  it("should return error message if employee is not found", async () => {
    Employee.findById = jest.fn().mockResolvedValue(null);

    await startBreak(req, res, next);

    expect(Employee.findById).toHaveBeenCalledWith("<employee_id>");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Break start failed." });
  });

  it("should return already started message if break is already started", async () => {
    expect.assertions(3);
    const employee = {
      timeAttendance: [{ clockIn: new Date(), breakStart: new Date() }],
      save: jest.fn().mockReturnThis(),
    };
    Employee.findById = jest.fn().mockResolvedValue(employee);

    await startBreak(req, res, next);

    expect(Employee.findById).toHaveBeenCalledWith("<employee_id>");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Break already started.",
    });
  });

  it("should return error message if break is started after clock-out", async () => {
    const employee = {
      timeAttendance: [{ clockIn: new Date(), clockOut: new Date() }],
    };
    Employee.findById = jest.fn().mockResolvedValue(employee);

    await startBreak(req, res, next);

    expect(Employee.findById).toHaveBeenCalledWith("<employee_id>");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cannot start break after clock-out.",
    });
  });
});

describe("clockIn function", () => {
  it("should throw an error if employee is not found", async () => {
    const req = {
      body: {
        employeeId: "nonexistentId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await clockIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Clock in failed." });
  });

  it("should clock in successfully if it is a new day", async () => {
    const employee = {
      timeAttendance: [],
      save: jest.fn().mockReturnThis(),
    };
    const req = {
      body: {
        employeeId: "existingId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // Mock the Employee.findById method
    Employee.findById = jest.fn().mockResolvedValueOnce(employee);

    await clockIn(req, res, next);

    expect(Employee.findById).toHaveBeenCalledWith("existingId");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Clock in successful." });
  });

  it('should return "Already clocked in" if it is the same day', async () => {
    const req = {
      body: {
        employeeId: "existingId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // Mock the Employee.findById method
    Employee.findById = jest.fn().mockResolvedValueOnce({
      timeAttendance: [
        {
          clockIn: new Date().toString(),
        },
      ],
    });

    await clockIn(req, res, next);

    expect(Employee.findById).toHaveBeenCalledWith("existingId");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Already clocked in" });
  });
});

describe("clockOut", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { employeeId: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return "Clock out failed." if employee does not exist', async () => {
    Employee.findById.mockResolvedValueOnce(null);

    await clockOut(req, res, next);

    expect(Employee.findById).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Clock out failed." });
  });

  test("should update break end time if break start time exists and break end time does not exist", async () => {
    const employee = {
      timeAttendance: [{ breakStart: "2022-01-01T12:00:00Z" }],
    };
    Employee.findById.mockResolvedValueOnce(employee);
    employee.save = jest.fn().mockResolvedValueOnce(employee);

    await clockOut(req, res, next);

    expect(employee.timeAttendance[0].breakEnd).toBeDefined();
    expect(employee.save).toHaveBeenCalled();
  });

  test("should update clock out time if clock in time exists and clock out time does not exist", async () => {
    const employee = {
      save: jest.fn(),
      timeAttendance: [{ clockIn: "2022-01-01T09:00:00Z" }],
    };
    Employee.findById.mockResolvedValueOnce(employee);

    await clockOut(req, res, next);

    expect(employee.timeAttendance[0].clockOut).toBeDefined();
    expect(employee.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Clock out successful." });
  });

  test('should return "Already clocked out" if clock in time and clock out time both exist', async () => {
    const employee = {
      timeAttendance: [
        { clockIn: "2022-01-01T09:00:00Z", clockOut: "2022-01-01T17:00:00Z" },
      ],
    };
    Employee.findById.mockResolvedValueOnce(employee);

    await clockOut(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Already clocked out." });
  });

  test('should return "Clock out failed" if an error occurs', async () => {
    Employee.findById.mockRejectedValueOnce(new Error("Some error"));

    await clockOut(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Clock out failed." });
  });
});

describe("endBreak()", () => {
  let req, res, next;
  beforeEach(() => {
    req = { body: { employeeId: "<employee_id>" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
    Employee.mockClear();
  });

  it("Should end break when employee clocks out and break is ongoing", async () => {
    const employee = {
      timeAttendance: [{ clockIn: new Date(), breakStart: new Date() }],
      save: jest.fn().mockReturnThis(),
    };

    Employee.findById = jest.fn().mockResolvedValue(employee);

    await endBreak(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Break ended successfully.",
    });
  });

  it("Cannot end break after clock-out", async () => {
    const employee = {
      save: jest.fn(),
      timeAttendance: [{ clockIn: new Date(), clockOut: new Date() }],
    };

    const req = { body: { employeeId: "123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Employee.findById = jest.fn().mockResolvedValue(employee);

    await endBreak(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cannot end break after clock-out.",
    });
  });

  it("Cannot end break if break is already ended", async () => {
    const employee = {
      save: jest.fn(),
      timeAttendance: [
        {
          clockIn: new Date(),
          breakStart: new Date(),
          breakEnd: new Date(),
        },
      ],
    };

    Employee.findById = jest.fn().mockResolvedValue(employee);

    await endBreak(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Break already ended." });
  });

  it("Should return error message when employee is not found", async () => {
    Employee.findById = jest.fn().mockResolvedValue(null);

    await endBreak(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Break end failed." });
  });

  it("Should return error message when an error occurs", async () => {
    const error = new Error("Test error");
    error.statusCode = 400;

    Employee.findById = jest.fn().mockRejectedValue(error);

    await endBreak(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Break end failed." });
  });
});
