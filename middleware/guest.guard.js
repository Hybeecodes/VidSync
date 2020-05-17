const faker = require('faker');

module.exports = (req, res, next) => {
    let { user } = req.session;
    if(! user) {
        user = {
            id: faker.random.uuid(),
            email: faker.internet.email(),
            username: faker.internet.userName()
        };
        req.session.user = user;
    }
    next();
};