// config/auth.js
var config = require('./config.json');
// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : config.facebook_clientID, // your App ID
        'clientSecret'    : config.facebook_clientSecret, // your App Secret
        'callbackURL'     : config.facebook_callbackURL
    }
};
