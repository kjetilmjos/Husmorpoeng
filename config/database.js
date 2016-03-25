// config/database.js
var config = require('./config.json');
module.exports = {

    'url' : config.mongodb_url // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot

};
