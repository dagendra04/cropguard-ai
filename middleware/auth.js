const auth = (req, res, next) => {
  const secret = req.headers['x-officer-secret'] || (req.body && req.body.officerSecret);
  const configured = process.env.OFFICER_SECRET;
  if (!configured || secret === configured) return next();
  res.status(401).json({ error: 'Unauthorized. Provide correct x-officer-secret header.' });
};
module.exports = auth;
