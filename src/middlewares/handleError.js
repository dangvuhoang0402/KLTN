const chalk = require('chalk')

const handleError = (err, req, res, next) => {
  // console.error('Error:', err.stack);
  console.error(chalk.grey('Error:', err.stack));
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" ,status:err.status || 500});
};
module.exports = handleError;
