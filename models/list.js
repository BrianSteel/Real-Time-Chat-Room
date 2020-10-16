const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Schema and models
const userListSchema = new Schema({
    name: String,
    room_name: String
});

//method model creates new model
//user-list is the name of the model
//which is essentially the collection name
//we are going to base the model based on the schema - userListSchema
//userList is each individual user every time a user enters
const userList = mongoose.model('user-list', userListSchema)

module.exports = userList;