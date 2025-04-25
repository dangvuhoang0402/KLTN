const authService = require("../services/AuthService")

const login = async (req, res, next) => {
    const result = await authService.login(req.body);
    if (result && result.token) {
        res.cookie('jwt', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });
        return res.redirect('/home');
    }
    return res.redirect('/auth/login');
};

const logout = async (req, res, next) => {
    res.clearCookie('jwt');
    return res.redirect('/auth/login');
};

const loginPage = async (req, res, next) => {
    res.render('pages/login');
};

module.exports = {
    login,
    logout,
    loginPage
};