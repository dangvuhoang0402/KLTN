const mongoose = require('mongoose')
const connectMongoDB = (connectString)=>{
    return mongoose.connect(connectString,{
        
    }).then(console.log("Connected to DB"))
}
module.exports = connectMongoDB