module.exports = errSerializer;

function errSerializer(err) {
  const response = {
    ...err,
  };
  if (err.body) {
    response.body = err.body;
  } else if (err.response && err.response.body) {
    response.body = err.response.body;
  }
  if (err.message) {
    response.message = err.message;
  }
  if (err.stack) {
    response.stack = err.stack;
  }
  return response;
}
