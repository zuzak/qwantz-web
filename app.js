var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var sassMiddleware = require('node-sass-middleware');

const winston = require('winston')
const expressWinston = require('express-winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const {ErrorReporting} = require('@google-cloud/error-reporting');
const errors = new ErrorReporting();

const loggerTransports = [
  new winston.transports.Console({
    colorize: process.env.NODE_ENV !== 'production',
    LoggingWinston
  })
]

var app = express();

app.use(expressWinston.logger({
  transports: loggerTransports
}))

var indexRouter = require('./routes/index');
var gptRouter = require('./routes/gpt');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public'), {
  immutable: true,
  maxAge: 1000 * 60 * 60
}));

if (process.env.TRUST_PROXY) {
  app.set('trust proxy')
}

app.all((req, res, next) => {
  res.locals.dnt = req.get('dnt')
  next()
})

if (!process.env.DISABLE_GPT) {
  app.use('/gpt', gptRouter);
}
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handlers

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.use(errors.express)
app.use(expressWinston.errorLogger({
  transports: loggerTransports
}))


module.exports = app;
