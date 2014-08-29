var acl = require('acl');

var appDir = __dirname + '/../';

/**
 * Log information on the console
 * @param  {string} msg message to display
 * @return {void}
 */
var logInfo = function (msg) {
	var d = new Date();
	console.log(d.toISOString() + '[' + process.pid + ']: ' + msg);
};

/**
 * Log the connection informations
 * @param  {object} req Http request (express)
 * @return {void}
 */
var logConnexions = function (req) {
	logInfo(req.method + ' ' + req.url.replace(/\?.*/, ''));
	logInfo('KEY => ' + req.user.key);
	for (var key in req.query) {
		logInfo("DATA\t" + key + ': ' + req.query[key]);
	}
};

/**
 * Extract resource name from the HTTP request
 * @param  {object} req Http request (express)
 * @return {string}     resource name
 */
var getResourceName = function (req) {
	var resource = req.url.slice(1).replace(/[\?\/].*/, '');
	return resource.length > 0 ? resource : null;
};

/**
 * Overload the http header with cross domain authorization
 * @param  {object} req Http  request (express)
 * @param  {object} req Http  resource (express)
 * @param  {array} domainList list of authorized domains
 * @return {void}
 */
var allowCrossDomain = function (req, res, domainList) {
	if (req.headers.origin) {
		for (var i in domainList) {
			if (domainList[i].toLowerCase() === req.headers.origin.toLowerCase()) {
				res.header('Access-Control-Allow-Origin', req.headers.origin);
			}
		}
	}
};

/**
 * Check for Http method (GET, POST, ...)
 * @param  {object} req Http  request (express)
 * @return {string}     Method name
 */
var getMethod = function (req) {
	if (req.query.method) {
		logInfo('! Forcing method to ' + req.query.method.toUpperCase());
		return req.query.method.toUpperCase();
	} else {
		return req.method.toUpperCase();
	}
};

/**
 * Load resources from the configuration
 * @param  {object} configuration Whole configuration
 * @return {object}               Resource descriptor
 */
var loadResources = function (configuration) {
	logInfo('Loading resource file ' + appDir + './resources/default');
	var defaultRoute = require(appDir + './resources/default');
	var resources = {};
	for (var route in configuration) {
		logInfo('Loading resource file ' + appDir + configuration[route].controller);
		resources[route] = require(appDir + configuration[route].controller);
	}
	return {
		resources: resources,
		defaultRoute: defaultRoute
	};
};

/**
 * Get the Auth key
 * @param  {object} req Http  request (express)
 * @return {string}     key
 */
var getAuthKey = function (req, defaultRole) {
	var key = defaultRole; //default value
	if (req.query.key) {
		key = req.query.key;
		delete req.query.key;
	} else if (req.headers['auth-token']) {
		key = req.headers['auth-token'];
	}
	req.user = {
		key: key,
		defaultKey: defaultRole
	};
	return key;
};

/**
 * Instanciate a Monk object on the database
 * @param  {object} configuration database configuration
 * @return {object}               Monk object pointing on the database
 */
var getDatabase = function (configuration) {
	if (!configuration.disabled) {
		var mongo = require('mongodb');
		var monk = require('monk');
		return monk(configuration.host + ':' + configuration.port + '/' + configuration.database);
	}
	return null;
};

/**
 * Configure the ACL
 * @param  {object} configuration Whole configuration
 * @param  {object} mongoDb       Monk object pointing on the API database
 * @return {object}               ACL
 */
var aclConfiguration = function (configuration, mongoDb) {
	var acl = require('acl');
	/* Specify backend */
	apiAcl = new acl(new acl.memoryBackend());
	/* Allow */
	for (var route in configuration.resources) {
		var thisAcl = configuration.resources[route].acl;
		if (thisAcl) {
			for (var method in thisAcl) {
				apiAcl.allow(thisAcl[method], route, method.toUpperCase());
			}
		}
	}
	/* Configure ACL hierarchies */
	for (var role in configuration.roles) {
		if (Object.prototype.toString.call(configuration.roles[role]) === '[object Array]') {
			apiAcl.addRoleParents(role, configuration.roles[role]);
		}
	}
	/* Configure roles and keys */
	var firstRole = Object.keys(configuration.roles)[0];
	apiAcl.addUserRoles(firstRole, firstRole);
	if (mongoDb) {
		mongoDb.get('user').find({}, {
				fields: {
					_id: false,
					role: true,
					key: true
				}
			},
			function (e, users) {
				for (var index in users) {
					logInfo('> role: ' + users[index].role + ' - key: ' + users[index].key);
					apiAcl.addUserRoles(users[index].key, users[index].role);
				}
			});
	} else {
		logInfo('No mongoDb was specified ! I cannot configure the ACL');
	}
	/* return object */
	return apiAcl;
};


// Export the module
module.exports = {
	logInfo: logInfo,
	logConnexions: logConnexions,
	getResourceName: getResourceName,
	allowCrossDomain: allowCrossDomain,
	getMethod: getMethod,
	loadResources: loadResources,
	getAuthKey: getAuthKey,
	getDatabase: getDatabase,
	aclConfiguration: aclConfiguration
};