// Global Error Handaling

const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value} .`;
  return new AppError(message, 400);
};

const handleDublicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; // see in note2
  console.log('same');
  const message = `Dublicate field value : ${value} Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data.${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  const message = 'Invalid token.Please logeIn Again';
  return new AppError(message, 401);
};

const handleJWTExpiredError = (err) =>
  new AppError('YOur token has expired please login again', 401);

const sendErrorDev = (err, res) => {
  // err = req

  res.status(err.statusCode).json({
    //name: err.name,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    ///true

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  else {
    //1.Log error
    console.error('**ERROR**', err.message);

    //2.Send Generic Message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(' from out dev/prod error');
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(err);

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDublicateFieldsDB(error);
    }
    if (error.name === 'ValidatonError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebToken') {
      //if(error.name === 'Error'){
      error = handleJWTError(error);
    }
    if (error.name === 'TokenexpiredError') {
      //if(error.name === 'Error'){
      error = handleJWTExpiredError(error);
    }

    sendErrorProd(err, res);
  }
};
