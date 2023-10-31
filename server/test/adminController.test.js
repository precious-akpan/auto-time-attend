jest.mock("express-validator", () => {
    return {validationResult: jest.fn(() => true)};
});
jest.mock("../models/employee.model");
// jest.mock("../utils/generateReport");
const Employee = require("../models/employee.model");
const sinon = require("sinon");
const bcrypt = require("bcryptjs");
const {validationResult} = require("express-validator");
const {
    getAllEmployees,
    addEmployee,
    modifyEmployee,
    report,
} = require("../controllers/adminController");
const {connect, disconnect, Types} = require("mongoose");
const {generateReport} = require("../utils/generateReport");

describe("AdminController", () => {
    beforeAll(() => {
        connect("mongodb://127.0.0.1:27017/test");
    });

    afterAll(async () => {
        await Employee.deleteMany({});
        disconnect();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks()
    });

    describe("getAllEmployees", () => {
        it("should fetch all employees and return them", async () => {
            const employees = [
                {name: "John Doe", age: 30},
                {name: "Jane Smith", age: 25},
            ];

            const findStub = sinon.stub(Employee, "find").resolves(employees);
            const jsonSpy = sinon.spy();
            const res = {json: jsonSpy};
            const nextSpy = sinon.spy();

            await getAllEmployees({}, res, nextSpy);

            sinon.assert.calledOnce(findStub);
            sinon.assert.calledWith(jsonSpy, {
                message: "Employees fetched",
                employees,
            });
            sinon.assert.notCalled(nextSpy);

            findStub.restore();
        });

        it("should handle error when failed to fetch employees", async () => {
            const error = new Error("Failed to fetch employees");
            const findStub = sinon.stub(Employee, "find").rejects(error);
            const nextSpy = sinon.spy();

            await getAllEmployees({}, {}, nextSpy);

            sinon.assert.calledOnce(findStub);
            sinon.assert.calledWith(nextSpy, error);

            findStub.restore();
        });
    });

    describe("addEmployee", () => {
        it("should create a new employee in the database and return a success message", async () => {
            const req = {
                employee: {
                    employeeId: new Types.ObjectId(),
                },
                body: {
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "1234567890",
                    password: "password",
                    isAdmin: false,
                },
            };
            const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
            const next = jest.fn();
            validationResult.mockReturnValue({
                isEmpty: jest.fn().mockReturnValue(true),
            });
            Employee.findOne.mockResolvedValue(null);

            await addEmployee(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Employee added",
            });
        });
    });

    describe("modifyEmployee function", () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                params: {employeeId: "employeeId"},
                body: {
                    name: "John Doe",
                    email: "johndoe@example.com",
                    phone: "1234567890",
                },
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            next = jest.fn();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test("should modify the employee and return success message", async () => {
            validationResult.mockReturnValue({
                isEmpty: jest.fn().mockReturnValue(true),
            });

            Employee.findById.mockResolvedValue({
                name: "Jane Doe",
                email: "janedoe@example.com",
                phone: "0987654321",
                save: jest.fn().mockResolvedValue({
                    name: "John Doe",
                    email: "johndoe@example.com",
                    phone: "1234567890",
                }),
            });

            await modifyEmployee(req, res, next);

            expect(validationResult).toHaveBeenCalledWith(req);
            expect(Employee.findById).toHaveBeenCalledWith("employeeId");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Employee updated",
                employee: {
                    name: "John Doe",
                    email: "johndoe@example.com",
                    phone: "1234567890",
                },
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("should throw validation error if validation fails", async () => {
            validationResult.mockReturnValue({
                isEmpty: jest.fn().mockReturnValue(false),
            });

            await modifyEmployee(req, res, next);

            expect(validationResult).toHaveBeenCalledWith(req);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].statusCode).toBe(422);
        });

        test("should throw error if employee is not found", async () => {
            validationResult.mockReturnValue({
                isEmpty: jest.fn().mockReturnValue(true),
            });
            Employee.findById.mockResolvedValue(null);

            await modifyEmployee(req, res, next);

            expect(validationResult).toHaveBeenCalledWith(req);
            expect(Employee.findById).toHaveBeenCalledWith("employeeId");
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });

        test("should throw error if database save fails", async () => {
            validationResult.mockReturnValue({
                isEmpty: jest.fn().mockReturnValue(true),
            });
            Employee.findById.mockResolvedValue({
                name: "Jane Doe",
                email: "janedoe@example.com",
                phone: "0987654321",
                save: jest.fn().mockRejectedValue(new Error("Database save error")),
            });

            await modifyEmployee(req, res, next);

            expect(validationResult).toHaveBeenCalledWith(req);
            expect(Employee.findById).toHaveBeenCalledWith("employeeId");
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].statusCode).toBe(500);
        });
    });

    describe("report", (object, method) => {
      it("should generate report for existing employee", async () => {
        const employeeId = "employeeId"; // Provide an existing employeeId
        const employee = {
          timeAttendance: [
            {
              clockIn:
                "Fri Oct 13 2023 21:17:31 GMT+0100 (West Africa Standard Time)",

              clockOut:
                "Sat Oct 14 2023 00:43:32 GMT+0100 (West Africa Standard Time)",

              breakStart:
                "Sat Oct 14 2023 00:43:19 GMT+0100 (West Africa Standard Time)",

              breakEnd:
                "Sat Oct 14 2023 00:43:32 GMT+0100 (West Africa Standard Time)",
            },
          ],
        };
        jest.spyOn(Employee, "findById").mockResolvedValueOnce(employee);

        const req = { params: { employeeId } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await report(req, res, next);

        expect(Employee.findById).toHaveBeenCalledWith(employeeId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: "Report generated",
          report: expect.any(Object),
        });
        expect(next).not.toHaveBeenCalled();
      });

      it("should throw error for non-existing employee", async () => {
        const employeeId = "nonExistingEmployeeId"; // Provide a non-existing employeeId
        jest.spyOn(Employee, "findById").mockResolvedValueOnce(null);

        const req = { params: { employeeId } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await report(req, res, next);

        expect(Employee.findById).toHaveBeenCalledWith(employeeId);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toBe("Employee not found");
        expect(next.mock.calls[0][0].statusCode).toBe(500);
      });
    });
});
