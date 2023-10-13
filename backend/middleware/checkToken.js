const jwt = require("jsonwebtoken");

function checkToken(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).send("Unauthorized");
  const token = authorization.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) return res.status(401).send("Unauthorized");
    req.body.userIdFromToken = decodedToken.userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).send("Unauthorized");
  }
}

module.exports = { checkToken };
