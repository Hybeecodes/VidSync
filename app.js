const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const mongoose = require('mongoose');

require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ds263028.mlab.com:63028/vid-sync`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('DB Connected');
}).catch((err) => {
  console.log('DB Error', err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24  // 1 day
  },
  resave: true,
  saveUninitialized: true,
  //
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;