const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not authenticated");
    req.isAuth = false;
    return next(error);
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "supersecretsecretkey");
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
    }
    req.isAuth = false;
    return next(error);
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }


  req.employee = {
    employeeId: decodedToken.employeeId,
    isAdmin: decodedToken.isAdmin,
  };
  req.isAuth = true;
  next();
};
