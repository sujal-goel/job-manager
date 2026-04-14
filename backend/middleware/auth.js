const ensureAuth = (req, res, next) => {
  const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
  const userId = auth?.userId;

  // Debug logging
  console.log('--- Auth Middleware Check ---');
  console.log('Auth Object exists:', !!req.auth);
  console.log('User ID:', userId);
  
  if (!userId) {
    console.warn('❌ Authentication Failed: Missing req.auth or userId');
    return res.status(401).json({ 
      message: 'Unauthenticated - Please sign in',
      debug: { auth: !!req.auth, userId: !!userId }
    });
  }

  req.userId = userId;
  
  console.log('✅ Authentication Successful for:', userId);
  next();
};


module.exports = { ensureAuth };
