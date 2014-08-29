var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
	var linkList = [];
	for (var route in req.allResources) {
		var link = 'http://' + req.headers.host + '/' + route;
		if ((req.user.key) && (req.user.key != req.user.defaultKey)) {
			link += '?key=' + req.user.key;
		}
		linkList.push(link);
	}
	if (req.db) {
		req.db.get('information').find({}, {
			sort: {
				version: -1
			},
			limit: 1,
			fields: {
				_id: false,
				code: true,
				name: true
			}
		}, function (e, docs) {
			docs[0].links = linkList;
			res.send(docs[0]);
		});
	} else {
		res.send({
			information: 'No database available',
			links: linkList
		});
	}
});


module.exports = router;