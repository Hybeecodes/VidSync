const User = require('../models/User');
module.exports = {
    userLogin: async (req, res, next) => {
        try {
            const { username, password } = req.body;
            if(!username || !password) {
                res.status(400).send({ message: 'Invalid Login Details'})
            }
            const user = User.findOne({ username });
            if (!user || !user.validPassword(password)) {
                return res.status(400).send({success: false, message: 'Invalid Username or Password'});
            }
            res.session.user = user;
            return res.status(200).send({success: true, message: 'Login Successful'});
        } catch (error) {
            next(error);
        }

    },

    userRegister: async (req, res, next) => {
        try {
            const { body } = req;
            // validate data
            const user = User.createUser(body);
            res.status(200).send(user.toJSON());
        } catch (e) {
            next(e);
        }
    }
};
