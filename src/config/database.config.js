const mongoose = require('mongoose');

const connectMongoDB = (connectString) => {
    return mongoose.connect(connectString, {
        serverSelectionTimeoutMS: 60000 // 60 seconds timeout
    })
    .then(() => console.log("Connected to DB"))
    .catch(err => console.error("MongoDB connection error:", err));
};

module.exports = connectMongoDB;