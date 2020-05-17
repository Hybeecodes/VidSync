const faker = require('faker');

module.exports = (req, res, next) => {
    let { user } = req.session;
    if(! user) {
        req.session.user = {
            id: faker.random.uuid(),
            email: faker.internet.email(),
            username: faker.internet.userName(),
            isLoggedIn: false
        };
    }
    next();
};