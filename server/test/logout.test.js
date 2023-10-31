const { logout } = require("../controllers/authController"); // Import the logout function

describe("logout", () => {
  it("should return a success message with status code 200", async () => {
    const req = {}; // Create a mock request object
    const res = {
      // Create a mock response object
      status: jest.fn().mockReturnThis(), // Mock the status method
      json: jest.fn(), // Mock the json method
    };
    const next = jest.fn(); // Create a mock next function

    await logout(req, res, next); // Call the logout function

    // Assert that the status method was called with 200
    expect(res.status).toHaveBeenCalledWith(200);
    // Assert that the json method was called with the success message
    expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
    // Assert that the next function was not called
    expect(next).not.toHaveBeenCalled();
  });
});
