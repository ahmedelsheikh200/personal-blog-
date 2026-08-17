const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema ({
    username : {  
    type: String,
    required: true,
    unique: true},

    email :{
    type: String,
    required: true,
    unique: true
    },

    password :{
    type: String,
    required: true
    },

    isAdmin : {type : Boolean , default:false},
    date: { type: Date, default: Date.now },
    likes :  [{
    type: Schema.Types.ObjectId,
    ref: 'Post' // Name of the model you are referencing
  }]
})


module.exports = mongoose.model('User' , userSchema)