const jwt = require('jsonwebtoken');
require("dotenv").config();


const authenticate =async (req, res, next) => {

  const token = req.cookies.token ||  req.header('Authorization')?.replace("Bearer ", "")  || req.body.token;
  // console.log("Received Token in Middleware:", token); // Add this line for debugging
  // console.log("Authorization Header:", req.header('Authorization'));
  // console.log("Cookies token:", req.cookies.token);
  // console.log("Body Token:", req.body.token);
  // console.log("Final Token Extracted:", token);
  if (!token) {
    return res.status(401).json({       
       success: false,
      message: 'No token, authorization denied',
  });
  }
// token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
   return res.status(403).json({     
     success: false,
    message: 'Token is not valid' });
  }
  // next();
};

module.exports = authenticate;
