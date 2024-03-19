const catchAsync = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((err) => {
      console.log(err);
      next(err);
    });
  };
};

export default catchAsync;
