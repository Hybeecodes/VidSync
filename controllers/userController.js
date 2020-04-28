const User = require('../models/User');
module.exports = {
    userLogin: async (req, res, next) => {
        try {
            const { username, password } = req.body;
            if(!username || !password) {
                res.status(400).send({ message: 'Invalid Login Details'})
            }
            User.loginUser(req.body);
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
