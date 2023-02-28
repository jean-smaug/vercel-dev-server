module.exports = (req, res) => {
  res.send(`The param value is ${req.query.id}`);
};
