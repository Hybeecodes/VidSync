const express = require('express');
const router = express.Router();
const { APP_NAME } = require('../config/config');
const {createUser, userLogin} = require('../controllers/userController');
const { nanoid } = require('nanoid');
const Session = require('../models/Session');
const faker = require('faker');
const AuthGuard = require('../middleware/auth.guard');

/* GET home page. */
router.get('/', AuthGuard, function(req, res) {
  res.render('index', { AppName: APP_NAME, title: 'Home', user: req.session.user });
});

router.get('/login', (req, res) => {
  res.render('auth/login', { AppName: APP_NAME, title: 'Login', user: null});
});

router.get('/register', (req, res) => {
  res.render('auth/register', { AppName: APP_NAME, title: 'Register', user: null})
});

router.post('/login', userLogin);

router.post('/register', createUser);

router.get('/sessions/:sessionId', AuthGuard, async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findOne({sessionId, status: 'ACTIVE'}).populate('adminId').populate('connectedUsers');
  console.log(session);
  res.render('session', { AppName: APP_NAME, title: 'Session', session, user: req.session.user })
});

router.get('/sessions/:sessionId/users', AuthGuard, async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findOne({sessionId}).populate({path: 'connectedUsers', select: 'username'});
  const userNames = session.connectedUsers.map((user) => {
    return user.username;
  });
  res.status(200).send({message: userNames});
});

router.post('/session/start', async (req, res) => {
  // create session
  const { videoId } = req.body;
  const sessionId = nanoid(10);
  const session = new Session({
    adminId: req.session.user.id,
    sessionId,
    videoId
  });
  await session.save();
  // generate random name till we implement auth
  req.session.adminName = faker.internet.userName();
  res.status(200).send({success: true, message: sessionId});
});

router.post('/session/:sessionId/newUser', async (req, res) => {
  const { sessionId } = req.params;
  const { userId } = req.body;
  // TODO:: Check if User Exists
  const session = await Session.findOne({sessionId, status: 'ACTIVE'});
  if (session) {
    session.connectedUsers.push(userId);
  }
  await session.save();
});


module.exports = router;
