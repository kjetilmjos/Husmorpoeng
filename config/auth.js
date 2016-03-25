// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '877124235708805', // your App ID
        'clientSecret'    : '03943b24f2aeb1ab36eea1b0a39d6b9a', // your App Secret
        'callbackURL'     : 'http://localhost:8080/auth/facebook/callback'
    }

};
