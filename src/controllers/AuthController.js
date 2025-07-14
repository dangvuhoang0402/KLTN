const authService = require("../services/AuthService")

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        if (result && result.token) {
            res.cookie('jwt', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });
            return res.redirect('/home');
        }
        // This should not be reached, but just in case:
        return res.render('pages/login_fail', { layout: false });
    } catch (error) {
        // On login fail, render the fail page
        return res.render('pages/login_fail', { layout: false, error: error.message });
    }
};

const logout = async (req, res, next) => {
    res.clearCookie('jwt');
    return res.redirect('/auth/login');
};

const loginPage = async (req, res, next) => {
    res.render('pages/login',{layout: false});
};

module.exports = {
    login,
    logout,
    loginPage
};