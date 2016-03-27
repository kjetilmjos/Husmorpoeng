var models = require('./models/schemas');
module.exports = function(app, passport) {
  var async = require('async');

  // normal routes ===============================================================
  // show the home page (will also have our login links)
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user: req.user,
    });
  });
  // HUSMOR SECTION =========================
  app.get('/husmor', isLoggedIn, function(req, res) {
    if (req.user.facebook.email) {
      var usermail = req.user.facebook.email;
    } else {
      var usermail = req.user.local.email;
    }
    var total_performed_tasks;
    var total_to_approve_tasks;
    // The number of total tasks performed. Approved and not approved.
    models.Done_Task.find({
      user: usermail
    }, {}, {}, function(err, total_done_tasks) {
      total_performed_tasks = Object.keys(total_done_tasks).length;
    });

    async.series([
      function(callback) {
        // User information
        models.User.find({
          email: usermail
        }, {}, {}).exec(callback);
      },
      function(callback) {
        // The 10 most recent performed tasks.
        models.Done_Task.find({
          user: usermail
        }, {}, {
          limit: 10,
          sort: {
            date: -1
          }
        }).exec(callback);
      },
      function(callback) {
        // Finds all tasks
        models.Task.find({}, {}, {
          sort: {
            name: 1
          }
        }).exec(callback);
      },
      function(callback) {
        // Looks up the tasks which you will need to approve
        models.User.find({
          approver: usermail
        }, {}, {}, function(err, users_to_approve) {
          if (users_to_approve[0] !== undefined) {
            var query = [];
            users_to_approve.forEach(function(item) {
              query.push(item.email)
            });
            models.Done_Task.find({
              user: {
                $in: query
              },
              approved: false
            }, {}, {
              sort: {
                date: -1
              }
            }, function(err, total_tasks_to_approve) {
              total_to_approve_tasks = Object.keys(total_tasks_to_approve).length;
              callback(null, total_tasks_to_approve);
            });
          } else {
            callback();
          }
        });

      },
      function(callback) {
        // Finds points of approver
        models.User.find({
          email: usermail,
        }, {}, {}, function(err, approver_user) {
          models.User.find({
            email: approver_user[0].approver,
          }, {}, {}, function(err, approver_result) {
            callback(null, approver_result);
          });
        });
      },
    ], function(err, results) {
      res.render('husmor.ejs', {
        tasks: results[2],
        user: results[0],
        completed_tasks: results[1],
        total_tasks_performed: total_performed_tasks,
        tfa: results[3],
        total_tasks_for_approval: total_to_approve_tasks,
        approver_points: results[4],
      });
    });
  });

  // CHANGE APPROVER  =========================
  app.post('/husmor/change_approver', isLoggedIn, function(req, res) {
    models.User.update({
      email: req.body.user
    }, {
      approver: req.body.approver,
    }, function(err, rawResponse) {
      //handle it
    })
    res.send("Sucess");
  });

  // APPROVE TASK  =========================
  app.post('/husmor/approve_task', isLoggedIn, function(req, res) {
    models.Done_Task.update({
      _id: req.body.id
    }, {
      approved: true,
    }, function(err, rawResponse) {

      models.User.find({
        email: req.body.usermail
      }, {}, {}, function(err, userpoint) {

        models.User.update({
          _id: userpoint[0]._id
        }, {
          points: +userpoint[0].points + +req.body.task_points,
        }, function(err, rawResponse) {
          res.send("Sucess");
        })
      })
    })
  });

  // DELETE TASK  =========================
  app.post('/husmor/delete_task', isLoggedIn, function(req, res) {
    models.Done_Task.remove({
      _id: req.body.id
    }, function() {});
    res.send("Sucess");
  });

  // RESET SCORE  =========================
  app.post('/husmor/reset_score', isLoggedIn, function(req, res) {
    models.User.update({
      email: req.body.email
    }, {
      points: 0,
    }, function(err, rawResponse) {
      //handle it
    })
    res.send("Sucess");
  });

  // CHANGE POINT LIMIT  =========================
  app.post('/husmor/change_point_limit', isLoggedIn, function(req, res) {
    models.User.update({
      email: req.body.email
    }, {
      point_limit: req.body.limit,
    }, function(err, rawResponse) {
      //handle it
    })
    res.send("Sucess");
  });

  // STORE TASK  =========================
  app.post('/husmor/store_task', isLoggedIn, function(req, res) {
    var new_task = new models.Done_Task({
      task_name: req.body.task_name,
      user: req.body.user_email,
      points: req.body.task_point,
      approved: false,
    });

    new_task.save(function(err, thor) {
      if (err) return console.error(err);
      //console.dir(new_task);
    });
    res.send("Lagret");
  });

  // GET FAVORITES  =========================
  app.post('/husmor/get_favorites', isLoggedIn, function(req, res) {
    if (req.user.facebook.email) {
      var usermail = req.user.facebook.email;
    } else {
      var usermail = req.user.local.email;
    }
    models.Done_Task.find({
      user: usermail,
      approved: true
    }, {}, {}, function(err, favorites) {

      qarry = [];
      favorites.forEach(function(element) {
        qarry.push(element.task_name);
      });

      darr = [];
      function foo(arr) {
        var count = 0;
        var a = [];

        arr.sort();
        var prev = arr[0];

        for (var i = 0; i < arr.length + 1; i++) {
          if (arr[i] === prev) {
            count = count + 1;
            prev = arr[i];

          } else {
            darr.push({
              "task_name": arr[i - 1],
              "count": count
            });
            prev = arr[i];
            count = 1;
          }
        }
      }
        var s = foo(qarry);
        var k = darr.sort(function(a, b) {
          return parseFloat(b.count) - parseFloat(a.count);
        });
      res.send(k);
    });

  });
  // CREATE HOUSEHOLD  =========================
  app.post('/husmor/createhousehold', isLoggedIn, function(req, res) {
    var new_household = new models.Household({
      description: req.body.description,
      owner: req.body.owner,
      members: "",
      tasks: "",
    });

    new_household.save(function(err, thor) {
      if (err) return console.error(err);
      //console.dir(new_task);
    });
    res.send("Ny husstand lagret");
  });
  // ADD MEMBER HOUSEHOLD  =========================
  app.post('/husmor/addmember', isLoggedIn, function(req, res) {
    models.Household.update({
      owner: req.body.owner
    }, {
      "$addToSet" : {"members": req.body.new_member},
    }, function(err, rawResponse) {
      //handle it
    })
    res.send("Medlem lagt til i husstand");
    });



  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/husmor', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/husmor', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // facebook -------------------------------

  // send to facebook to do the authentication
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
  }));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/husmor',
      failureRedirect: '/'
    }));

  // =============================================================================
  // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
  // =============================================================================

  // locally --------------------------------
  app.get('/connect/local', function(req, res) {
    res.render('connect-local.ejs', {
      message: req.flash('loginMessage')
    });
  });
  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/husmor', // redirect to the secure profile section
    failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // facebook -------------------------------

  // send to facebook to do the authentication
  app.get('/connect/facebook', passport.authorize('facebook', {
    scope: 'email'
  }));

  // handle the callback after facebook has authorized the user
  app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect: '/husmor',
      failureRedirect: '/'
    }));


  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/husmor');
    });
  });

  // facebook -------------------------------
  app.get('/unlink/facebook', isLoggedIn, function(req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
      res.redirect('/husmor');
    });
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
