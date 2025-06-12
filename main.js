const express = require('express');
var dotenv = require('dotenv');
const morgan = require('morgan');
const chalk = require('chalk')
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

const connectMongoDB = require('./src/config/database.config')
const handleError = require('./src/middlewares/handleError');
const verifyToken = require('./src/middlewares/verifyToken');
const authorized  = require('./src/middlewares/authorized');
const handleResponse  = require('./src/middlewares/handleResponse');

const userRoute = require("./src/route/UserRoute");
const authRoute = require("./src/route/AuthRoute");
const homeRoute = require("./src/route/HomeRoute");
const foodRoute = require("./src/route/FoodRoute");
const orderRoute = require("./src/route/OrderRoute");
const viewRoute = require("./src/route/ViewRoute");

var env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
const port = process.env.PORT;



const app = express();

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('public'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

const customMorgan = (tokens, req, res) => {
    const time = chalk.yellow(tokens.date(req, res, 'clf'));
    const method = chalk.green(tokens.method(req, res));
    const url = chalk.green(tokens.url(req, res));
    const status = chalk.green(tokens.status(req, res));

    return `${time} Method:${method} Url:${url} status:${status} `;
};

app.use(morgan(customMorgan));

app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));

app.use("/auth",authRoute,handleResponse)
app.use("/user",userRoute,handleResponse)
app.use("/food",foodRoute,handleResponse)
app.use("/order",orderRoute,handleResponse)
app.use("/",homeRoute)
app.use('/view',viewRoute);

app.use(handleError)

connectMongoDB(process.env.URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;

