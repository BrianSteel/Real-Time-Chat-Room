const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//connects to mongodb database daving file
//localhost means mongodb in our local pc
//listOfUsers is the file whr it is saved
const connect = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/listOfUsers');

//this is to check for "connection" event to get established
//console logs when there is a connection open even
//also console logs when there is an error
const connectLog = mongoose.connection.once('open', function(){
    console.log('Connection has been made!')
}).on('error', (error) => {
    console.log('Error occured', error);
})

module.exports = {
    connectLog,
    connect
}


