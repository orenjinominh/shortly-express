const models = require('../models');
const Promise = require('bluebird');

/* expectations:
- new session when no cookies on request
-assigns session obj to req if session exists on db
-sets a new cookie on res when session starts
- creates a new hash for each new session
- if session is assigned to user, assign username and user
*/

module.exports.createSession = (req, res, next) => {
// if cookie exists- check database for session
console.log('this is a req ====>', req.body);
  if (req.cookies && req.cookies.shortlyid) {
    // console.log('**********************************************************************************************');
    models.Sessions.get({hash: req.cookies['shortlyid']})
    .then(session => {

      if (session) {
        // console.log('This is session ====> ', session)
        req.session = session;
        res.cookie('shortlyid', req.session.hash); //method
        var id = session.userId;

        if (id) { //this checks if user matches
          req.session.userId = id;
          models.Users.get({id})
            .then(userData => {
              // then,get username associated with id of session
              //if id===userData.id
              req.session.user =  {username: userData.username};
              // console.log('this is user on req.session', req.session.user);
              next();
            })
        } else { // if id doesn't match or is null, skip

          next();
        }

      } else { // if session hash doesn't exist on table, create it and also set cookie
        // cookie has bad hash
        //models.Sessions.delete({id: 1});
        models.Sessions.create()
          .then(data => {
            console.log('data from session db is here --->', data);
            var id = data.insertId;
            return models.Sessions.get({id});  //this returns undefined
          })
          .then(sessionData => {
            console.log('this is sessionData--->', sessionData);
            req.session = sessionData;
            res.cookie('shortlyid', sessionData.hash);
            next();
          });
      }

    });// this closes then
  } else { // if cookie doesn't exist, create session and put session info on req.

    models.Sessions.create()
    .then(data => {
      // console.log('sessions db data is here--->', data);
      var id = data.insertId;
      return models.Sessions.get({id});
    })
    .then(sessionData => {
      // console.log('session data from db is here --->', sessionData);
      req.session = sessionData;
      res.cookie('shortlyid', sessionData.hash);
      next();
    });
    // .then(() => {
    //   var username = req.body.username;
    //   console.log('username', username);
    //   console.log('body of the req', req.body);
    //   req.session.user = {username};
    //   return models.Users.get({username});
    // })
    // .then((userData) => {
    //   console.log('userData is here', userData);
    //   if (userData !== null) {
    //     req.session.userId = userData.id;
    //   }
    // });
  }
};



/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res, next) => {

/*
Add a verifySession helper function to all server routes that require login, redirect the user to a login page as needed. Require users to log in to see shortened links and create new ones. Do NOT require the user to login when using a previously shortened link.
 Give the user a way to log out. What will this need to do to the server session and the cookie saved to the client's browser?

*/
  console.log('LOOOOOOKKKKKK session user is here--->', req.session);

  if (!models.Sessions.isLoggedIn(req.session)) {
    console.log('BBBBBBBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADDDDDD!!!!!!!!!!!!!' );

    res.redirect('/login');
  } else {
    console.log('if we see this, we should be redirected to login');
    // models.Sessions.delete({hash:req.cookies.shortlyid});
    // res.clearCookie('shortlyid');
    next();
  }
};
