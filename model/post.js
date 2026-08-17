const mongoose = require('mongoose');
const {Schema} = mongoose;

const postSchema = new Schema({
    title :{type:String , required : true , unique : true},
    article :{type:String , required : true , unique : true},
    likes : {type:Number , default: 0},
    author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', // Must match the exact model name string
    required : true
  },
    createdAt: { 
    type: String, 
    // Generates "YYYY-MM-DD" automatically upon document creation
    default: () => new Date().toISOString().split('T')[0] 
  }
})

module.exports = mongoose.model('Post', postSchema);