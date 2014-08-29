var prompt = require('prompt');
var md5 = require('MD5');
var _s = require('underscore.string');


var onErr = function (err) {
  console.log(err);
  db.close();
  return 1;
};

var getDatabase = function (configuration) {
  var mongo = require('mongodb');
  var monk = require('monk');
  return monk(configuration.host + ':' + configuration.port + '/' + configuration.database);
};


console.log("###################");
console.log("## USER CREATION ##");
console.log("###################\n");

var conf = require('../api/config.json');

/* Database connection */
var mongo = require('mongodb');
var monk = require('monk');
var db = getDatabase(conf.db);

prompt.start();

var fields = [{
  name: 'firstname',
  description: 'Firstname',
  type: 'string',
  required: true
}, {
  name: 'lastname',
  description: 'Lastname',
  type: 'string',
  required: true
}, {
  name: 'email',
  description: 'Email',
  pattern: /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)+$/,
  required: true
}, {
  name: 'pass1',
  description: 'Password',
  type: 'string',
  hidden: true,
  required: true
}, {
  name: 'pass2',
  description: 'Retype password',
  type: 'string',
  hidden: true,
  required: true
}, {
  name: 'role',
  description: 'Role',
  type: 'string',
  required: true
}];

prompt.get(fields, function (err, result) {
  if (err) {
    return onErr(err);
  }
  // check passwords
  if (result.pass1 !== result.pass2) {
    console.log('You typed different passwords. Retry !');
  } else {
    console.log('Creating new entry in database ...');
    var d = new Date();
    var user = {
      firstname: _s.capitalize(result.firstname),
      lastname: _s.capitalize(result.lastname),
      email: result.email.toLowerCase(),
      login: result.email.toLowerCase(),
      role: result.role.toLowerCase(),
      password: md5(result.pass1 + conf.salt),
      key: md5(result.email + d.toString() + conf.salt)
    };
    db.get('user').index('login', {
      unique: true
    });
    db.get('user').insert(user, function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("User identified by login " + user.login + " added.\n");
      }
      db.close();
    });
  }


});