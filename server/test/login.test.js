const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/employee.model'); // Assuming the employee model is imported
const { login } = require('../controllers/authController');
describe('login', () => {
    it('should login successfully with valid email and password', async () => {
        const req = { body: { email: 'test@example.com', password: 'password' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        const employee = { email: 'test@example.com', password: await bcrypt.hash('password', 10), _id: 'employeeId' };
        Employee.findOne = jest.fn().mockResolvedValue(employee);
        bcrypt.compare = jest.fn().mockResolvedValue(true);
        jwt.sign = jest.fn().mockReturnValue('token');

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Login successful',
            token: 'token',
            employeeId: 'employeeId'
        });
    });

    it('should throw error when user does not exist', async () => {
        const req = { body: { email: 'test@example.com', password: 'password' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        Employee.findOne = jest.fn().mockResolvedValue(null);

        await login(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Employee not found.'));
    });

    it('should throw error when password is invalid', async () => {
        const req = { body: { email: 'test@example.com', password: 'password' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        const employee = { email: 'test@example.com', password: await bcrypt.hash('password', 10) };
        Employee.findOne = jest.fn().mockResolvedValue(employee);
        bcrypt.compare = jest.fn().mockResolvedValue(false);

        await login(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Invalid password'));
    });

    it('should throw error when email or password is missing', async () => {
        const req = { body: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await login(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should throw error when an error occurs during database query or token generation', async () => {
        const req = { body: { email: 'test@example.com', password: 'password' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        Employee.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

        await login(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Database error' }));
    });
});