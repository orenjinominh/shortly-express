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
    console.log('**********************************************************************************************');
    models.Sessions.get({hash: req.cookies['shortlyid']})
    .then(session => {

      if (session) {
        console.log('This is session ====> ', session)
        req.session = session;
        res.cookie('shortlyid', req.session.hash); //method
        var id = session.userId;

        if (id) { //this checks if user matches
          req.session.userId = id;
          models.Users.get({id})
            .then(userData => {
              // then,get username associated with id of session
              //if id===userData.id
              req.session.user = {username: userData.username};
              next();
            })
        } else { // if id doesn't match or is null, skip
          next();
        }

      } else { // if session hash doesn't exist on table, create it and also set cookie
        // cookie has bad hash
        console.log('model sessions is here -->', models.Sessions);
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
      console.log('sessions db data is here--->', data);
      var id = data.insertId;
      return models.Sessions.get({id});
    })
    .then(sessionData => {
      console.log('session data from db is here --->', sessionData);
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

