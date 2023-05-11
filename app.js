const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug'); //defining the template(no need to install)
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
//with defining static, we define that all the static assets will always automatically be served from a folder called 'public'. That's why in base.pug file, we directly get the css, because of setting it up here. It's the same and for the images, because they are located in the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
//this limiter is a middleware function, rateLimit is a function which based on our objects, create a middleware function, which we can use in app.use('/api')
const limiter = rateLimit({
  max: 100, //allows 100 requests per IP
  windowMs: 60 * 60 * 1000, //in one hour -> converted in milliseconds
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //parses data from the body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); //parses data from the cookies

// Data sanitization means to clean all the data that comes into the app from malicious code. Code that is trying to attack our app
// Data sanitization against NoSQL query injection
//mongoSanitize is a function which we call then returns a middleware function, which we can use. This is enough to prevent us against the kind of attack that we just saw before(log in only with password and for email using this query(query injection attack -> "email": {"$gt": ""})). This middleware looks in req.body, request query strings, request.params, and it filter all of the dollas signs and dots.
app.use(mongoSanitize());

// Data sanitization against XSS
//this will clean any user input from malicious HTML cod. Attacker would try to insert som malicious HTML code with some JS code attached to it. That late will be injected in our HTML site, and it can create some damage. Using this middleware we prevent that by converting all these HTML symbols
app.use(xss());

// Prevent parameter pollution
// hpp -> http parameter pollution
app.use(
  hpp({
    //whitelist is simply an array of properties for which we allow duplicates in the query string
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
