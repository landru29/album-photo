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


console.log("##################");
console.log("## USER DELETE ##");
console.log("#################\n");

var conf = require('../api/config.json');

/* Database connection */
var mongo = require('mongodb');
var monk = require('monk');
var db = getDatabase(conf.db);

prompt.start();

var fields = [{
  name: 'login',
  description: 'Login',
  type: 'string',
  required: true
}];

prompt.get(fields, function (err, result) {
  if (err) {
    return onErr(err);
  }
  console.log('Delete ' + result.login + ' ...');
  db.get('user').remove({
    login: result.login
  }, function (err, removed) {
    if (err) {
      console.log('Could not remove login ' + result.login);
    } else {
      if (removed !== 1) {
        console.log(result.login + ' was not found. So sorry for you !');
      } else {

        console.log('User identified by ' + result.login + ' is removed.');
      }
    }
    db.close();
  });
});