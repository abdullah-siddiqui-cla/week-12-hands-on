/**
 * Logs the Authorization header (undefined if missing).
 */
function auth(req, res, next) {
  console.log('[auth] Authorization:', req.get('Authorization'));
  next();
}

module.exports = { auth };
