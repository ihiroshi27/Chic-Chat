const express = require('express');

const token = require('../token');
const user = require('../model/user');

const router = express.Router();

router.get('/', function(req, res, next) {
	let query = req.query.q;
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		let payload = token.decode(req.headers.authorization.replace('Bearer ', ''));
		user.find(payload.id, query)
		.then((rows) => {
			res.json({ 
				friends: rows.map(function(row) {
					return { 
						id: row.id,
						username: row.username,
						name: row.name,
						profile: row.profile,
						friended: row.friended
					}
				})
			});
		})
		.catch((err) => next(err));
	}
});

module.exports = router;