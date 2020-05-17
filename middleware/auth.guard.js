module.exports = (req, res, next) => {
    if(!req.session.user || !req.session.user.isLoggedIn ) {
        req.session.prevUrl = req.url;
        return res.redirect('/login');
    }
    next();
}