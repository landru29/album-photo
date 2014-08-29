var md5 = require('MD5');
var express = require('express');
var router = express.Router();
var collectionName = 'user';

/* GET translation */
router.get('/', function (req, res) {
	if ((req.query.login) && (req.query.password)) {
		req.db.get(collectionName).findOne({
			login: req.query.login,
			password: md5(req.query.password + req.conf.salt)
		}, {
			fields: {
				_id: false,
				key: true,
				role: true
			}
		}, function (e, user) {
			if (user) {
				res.send(user);
			} else {
				res.send({
					status: 'error',
					message: 'User not found'
				});
			}
		});
	} else {
		res.send({
			status: 'error',
			message: 'Missing login and password'
		});
	}
});

module.exports = router;