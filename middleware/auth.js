const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('[AUTH_MIDDLEWARE] Auth middleware hit.');
  
  // Get tokens from all possible sources
  const cookieToken = req.cookies?.token;
  const frontendToken = req.cookies?.frontendToken;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  console.log('[AUTH_MIDDLEWARE] Token sources:', {
    cookieToken: cookieToken ? 'Present' : 'Missing',
    frontendToken: frontendToken ? 'Present' : 'Missing',
    headerToken: headerToken ? 'Present' : 'Missing'
  });

  // Priority order: frontendToken > headerToken > cookieToken
  const tokenToVerify = frontendToken || headerToken || cookieToken;
  
  if (!tokenToVerify) {
    console.log('[AUTH_MIDDLEWARE] No valid token found in any source');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(tokenToVerify, process.env.JWT_SECRET);
    req.user = decoded;
    
    // If we used a different token than what's in the cookie, update the cookie
    if (tokenToVerify !== cookieToken) {
      // Clear any existing tokens
      res.clearCookie('token');
      res.clearCookie('frontendToken');
      
      // Set new tokens
      res.cookie('token', tokenToVerify, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      res.cookie('frontendToken', tokenToVerify, {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      console.log('[AUTH_MIDDLEWARE] Updated cookie tokens to match verified token');
    }
    
    console.log('[AUTH_MIDDLEWARE] Token verified successfully. User ID:', decoded.userId);
    next();
  } catch (err) {
    console.error('[AUTH_MIDDLEWARE] Token verification failed:', err.message);
    // Clear invalid tokens
    res.clearCookie('token');
    res.clearCookie('frontendToken');
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 