const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  console.log("url", req.originalUrl)
  if ( req.originalUrl != "/api/auth/login" && req.originalUrl != '/api/auth/register') {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Từ chối truy cập vì không cung cấp token.');
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (ex) {
      res.status(400).send('Token không hợp lệ.');
    }
  } else {
    next();
  }
}

module.exports = auth;
