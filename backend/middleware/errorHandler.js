// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error("ERROR :", err);

  // Send error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
