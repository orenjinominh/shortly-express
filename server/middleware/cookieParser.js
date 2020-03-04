const parseCookies = (req, res, next) => {
  var cookieObject = {};

  if (req.headers.cookie) {
    var cookies = req.header.cookie.split('; ');
    cookies.forEach((cookie) => {
      var cookieArray = cookie.split('=');
      cookieObject[cookieArray[0]] = cookieArray[1];
    });
  }

  req.cookies = cookieObject;
  next();
};

module.exports = parseCookies;

//function that will access the cookies on an incoming request, parse them into an object, and assign this object to a cookies property on the request.