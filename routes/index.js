const express = require('express');
const router = express.Router();
const { APP_NAME } = require('../config/config');
const userController = require('../controllers/userController');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { AppName: APP_NAME, title: 'Home' });
});

router.get('/login', (req, res) => {
  res.render('auth/login', { AppName: APP_NAME, title: 'Login'});
});

router.get('/register', (req, res) => {
  res.render('auth/register', { AppName: APP_NAME, title: 'Register'})
});

router.post('/login', userController.userLogin);

router.post('/register', userController.userRegister);

router.get('/sessions/:sessionId', (req, res) => {
  res.render('session', { AppName: APP_NAME, title: 'Session' })
});

router.post('/session/start', (req, res) => {
  // create session
  res.send('6456');
});


module.exports = router;
