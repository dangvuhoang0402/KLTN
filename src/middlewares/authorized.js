const CustomError = require("../error/CustomError");

const authorized = (req, res, next) => {
    console.log('Current user role:', req.user.role);
    console.log('Requested path:', req.baseUrl);
    console.log('Requested method:', req.method);

    const roleUrl = {
        'reader': {
            'GET': ['/book', '/book/:id'],
            'POST': [],
            'PUT': [],
            'DELETE': []
        },
        'librarian': {
            'GET': [
                '/book', '/book/:id',
                '/author', '/author/:id',
                '/penalty-receipt', '/penalty-receipt/:id',
                '/reader', '/reader/:id',
                '/report-book-return', '/report-book-return/:id',
                '/loan-ticket', '/loan-ticket/:id','/return-ticket', '/return-ticket/:id',
                '/report-book-borrow', '/report-book-borrow/:id',
            ],
            'POST': [
                '/book', '/author', '/penalty-receipt',
                '/report-book-borrow',
                '/report-book-return',
                '/loan-ticket', '/reader', '/return-ticket'
            ],
            'PUT': [
                '/book/:id', '/author/:id', '/penalty-receipt/:id',
                '/report-book-borrow-by-type/:id',
                '/report-book-return/:id',
                '/loan-ticket/:id'
            ],
            'DELETE': [
                '/book/:id', '/author/:id', '/penalty-receipt/:id',
                '/report-book-borrow-by-type/:id',
                '/report-book-return/:id',
                '/loan-ticket/:id',
            ]
        },
        'owner': {}
    };  
    
    const role = req.user.role;
    const requestedPath = req.baseUrl;  // /book instead of /books
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