const mongoose = require('mongoose');
const User_data= new mongoose.Schema(
    {
        email : {type : String,required: true, unique:true},
        password : {type: String,required: true},
        created_date: {type : Date, default: Date.now }

    },{
        // collection: 'users'
    });

module.exports = mongoose.model('user', User_data);