const jwt = require('jsonwebtoken');
const middleware = require('../middleware/auth');

describe('Middleware', () => {
    const req = { get: jest.fn() };
    const res = {};
    const next = jest.fn();

    beforeEach(() => {
        req.get.mockClear();
        next.mockClear();
    });

    it('should set req.isAuth to false and call next with an error if Authorization header is missing', () => {
        middleware(req, res, next);

        expect(req.isAuth).toBe(false);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(new Error('Not authenticated'));
    });

    it('should set req.isAuth to false and call next with an error if token cannot be decoded', () => {
        req.get.mockReturnValue('Bearer invalidToken');

        middleware(req, res, next);

        expect(req.isAuth).toBe(false);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should set req.isAuth to true and set employeeId and isAdmin based on decoded token', () => {
        const token = jwt.sign({ employeeId: '123', isAdmin: true }, 'supersecretsecretkey');
        req.get.mockReturnValue(`Bearer ${token}`);

        middleware(req, res, next);

        expect(req.isAuth).toBe(true);
        expect(req.employee.employeeId).toBe('123');
        expect(req.employee.isAdmin).toBe(true);
        expect(next).toHaveBeenCalledTimes(1);
    });
});