/**
 * Walk recursively through folders
 * @param  {string}   dir  Folder to walk in
 * @param  {Function} done Callback when done in the current folder
 * @return {void}
 */
var walk = function (dir, done) {
	var fs = require('fs');
	var initialDir = dir;
	var results = [];
	fs.readdir(dir, function (err, list) {
		if (err) return done(err);
		var i = 0;
		(function next() {
			var file = list[i++];
			if (!file) return done(null, results);
			if (file.charAt(0) !== '.') {
				file = dir + '/' + file;
				fs.stat(file, function (err, stat) {
					if (stat && stat.isDirectory()) {
						walk(file, function (err, res) {
							results = results.concat(res);
							next();
						});
					} else {
						results.push(file);
						next();
					}
				});
			} else {
				next();
			}
		})();
	});
};

/**
 * Replace spaces in a filename by -
 * @param  {string} str Filename
 * @return {string}     Adapted filename
 */
var filize = function (str) {
	return str.trim().replace(/\s+/g, '-');
};


// export the module
module.exports = {
	filize: filize,
	walk: walk
};