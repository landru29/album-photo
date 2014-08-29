var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var utils = require('./local-lib/utils');

// Load configuration
var conf = require('./config.json');

utils.logInfo('** Initialize Express **');

// Database connection
var db = utils.getDatabase(conf.db);

// Configure ACL
apiAcl = utils.aclConfiguration(conf, db);

// load resources
var resourceDef = utils.loadResources(conf.resources);

// Initialize the API
var app = express();

// pre treatement
app.use(function (req, res, next) {
	// pass parameters
	req.conf = conf; // All the configuration
	req.logInfo = utils.logInfo; // log function
	req.db = db; // Link the database
	req.allResources = resourceDef.resources; // resources
	// check for authentification key
	utils.getAuthKey(req, Object.keys(conf.roles)[0]);
	// check for cross domain
	utils.allowCrossDomain(req, res, conf.cors);
	// Analyze method
	switch (utils.getMethod(req)) {
	case 'OPTIONS':
		var allowedHeaderFields = ['origin', 'content-type', 'accept', 'Auth-Token'];
		var allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
		utils.logInfo('Allow headers fields : ' + allowedHeaderFields.join(', '));
		res.header('Access-Control-Allow-Headers', allowedHeaderFields.join(', '));
		res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
		next();
		break;
	default:
		var requestedRoute = utils.getResourceName(req);
		// log information about the access
		utils.logConnexions(req);
		// check if a specific file was requested
		if ((requestedRoute) && (fs.existsSync('./public' + req.url))) {
			res.sendfile(req.url, {
				root: __dirname + '/public'
			});
		} else {
			// ACL
			if (requestedRoute) {
				apiAcl.isAllowed(req.user.key, requestedRoute, req.method.toUpperCase(), function (aclErr, aclRes) {
					if (aclRes) {
						next();
					} else {
						var errorMessage = 'User not allowed to perform ' + req.method.toUpperCase() + ' operation on resource ' + requestedRoute;
						utils.logInfo(errorMessage);
						res.send({
							status: 'error',
							message: errorMessage
						});
					}
				});
			} else {
				next();
			}
		}
	}
});

// Define the routes
app.use('/', resourceDef.defaultRoute);
for (var route in resourceDef.resources) {
	utils.logInfo('> Adding route ' + route);
	app.use('/' + route, resourceDef.resources[route]);
}

utils.logInfo('** Express is ready **');

// Export the module
module.exports = app;