const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    name: String,
    message: String,
    room: String,
    time: { type: Date, default: Date.now }
});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;
