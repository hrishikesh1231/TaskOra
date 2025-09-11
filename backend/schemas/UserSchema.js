const {Schema} = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose'); 

const UserSchema =new Schema({
    email:String,
});


UserSchema.plugin(passportLocalMongoose);
module.exports = {UserSchema};