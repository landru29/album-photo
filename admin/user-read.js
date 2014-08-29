var getDatabase = function (configuration) {
	var mongo = require('mongodb');
	var monk = require('monk');
	return monk(configuration.host + ':' + configuration.port + '/' + configuration.database);
};


console.log("#################");
console.log("## USERS IN DB ##");
console.log("#################\n");

var conf = require('../api/config.json');

/* Database connection */
var mongo = require('mongodb');
var monk = require('monk');
var db = getDatabase(conf.db);

db.get('user').find({}, {
		fields: {
			_id: false,
			password: false,
		}
	},
	function (err, doc) {
		if (err) {
			console.log(err);
		} else {
			for (var i in doc) {
				console.log('[' + doc[i].key + '] ' + doc[i].firstname + ' ' + doc[i].lastname + ' (' + doc[i].login + ')');
			}
		}
		db.close();
	});