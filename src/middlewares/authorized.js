const CustomError = require("../error/CustomError");

const authorized = (req, res, next) => {
    console.log('Current user role:', req.user.role);
    console.log('Requested path:', req.baseUrl);
    console.log('Requested method:', req.method);

    const roleUrl = {
        'owner': {}
    };  
    
    const role = req.user.role;
    const requestedPath = req.baseUrl;  
    const requestedMethod = req.method;

    if (role === 'owner') {
        next();
    } else {
        if (roleUrl[role] && 
            roleUrl[role][requestedMethod] && 
            roleUrl[role][requestedMethod].some(path => {
                // Handle dynamic routes with parameters
                const routePattern = path.replace(/:\w+/g, '[^/]+');
                const regex = new RegExp(`^${routePattern}$`);
                return regex.test(requestedPath);
            })) {
            next();
        } else {
            next(new CustomError(403, "Unauthorized"));
        }
    }
};

module.exports = authorized;