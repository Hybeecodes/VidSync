const User = require('../models/User');

const createUser = async (req, res) => {
    const {email, username, password, con_password} = req.body;
    if (!email || !username || !password || !con_password) {
        return res.status(400).send({status: 0, message: 'One or more Credentials Missing'});
    }
    if (password !== con_password) {
        return res.status(400).send({status: 0, message: 'Password and Confirm Password must be the same'});
    }
    let user = await User.findOne({email});
    if (user) {
        return res.status(400).send({status: 0, message: `User with email '${email}' exists already`});
    }
    user = await User.findOne({username});
    if (user) {
        return res.status(400).send({status: 0, message: `User with username '${userName}' exists already`});
    }
    const newUser = new User(req.body);
    if (!await newUser.save()) {
        return res.status(500).send({status: 0, message: 'Unable to Create New User'});
    }
    return res.status(201).send({status: 1, message: 'Registration Successful!!'});
}

const userLogin = async (req, res) => {
    const { username, password} = req.body;
    if (!username || !password) {
        return res.status(400).send({status: 0, message: 'One or more Credentials Missing'});
    }
    const user = await User.findOne({username});
    if (!user) {
        return res.status(400).send({status: 0, message: 'Invalid Email or Password'});
    }
    if (!user.comparePass(password)) {
        return res.status(400).send({status: 0, message: 'Invalid Email or Password'});
    }
    req.session.user = user.toJson();
    return res.status(200).send({status: 1, message: 'Login Successful!!'});
}


module.exports = {
    createUser,
    userLogin
};