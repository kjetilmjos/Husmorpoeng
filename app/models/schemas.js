// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var passportUserSchema = mongoose.Schema({

  local: {
    name: String,
    email: String,
    password: String,
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String,
  },

});

var UserSchema = mongoose.Schema({
  name: String,
  email: String,
  points: Number,
  last_reset: Date,
  approver: String,
  point_limit: Number,
});

var tasksSchema = mongoose.Schema({
  name: String,
  points: Number,
  achievements: String,
});

var done_tasksSchema = mongoose.Schema({
  task_name: String,
  user: String,
  points: Number,
  approved: Boolean,
  date: {
    type: Date,
    default: Date.now
  },
});

var householdSchema = mongoose.Schema({
  description: String,
  owner: String,
  members: [String],
  tasks: [Object],
});

// generating a hash
passportUserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
passportUserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
var PassportUser = mongoose.model('PassportUser', passportUserSchema);
var Task = mongoose.model('Task', tasksSchema);
var Done_Task = mongoose.model('Done_Task', done_tasksSchema);
var User = mongoose.model('User', UserSchema);
var Household = mongoose.model('Household', householdSchema);

module.exports = {
  PassportUser: PassportUser,
  Task: Task,
  User: User,
  Done_Task: Done_Task,
  Household: Household
};
