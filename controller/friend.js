const express = require('express');

const token = require('../token');
const friend = require('../model/friend');

const router = express.Router();

router.get('/', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((payload) => {
			friend.find(payload.id)
			.then((rows) => res.json({ 
				friends: rows.map((row) => ({
					id: row.id,
					name: row.name,
					profile: row.profile
				}))
			}))
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	}
});

router.post('/', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((payload) => {
			let friendID = req.body.friendID;

			if (payload.id === friendID) {
				next(new Error('Invalid FriendID'));
			} else {
				friend.add(payload.id, friendID)
				.then((results) => res.json({ results: results }))
				.catch((err) => next(err));
			}
		})
		.catch((err) => next(err));
	}
});

router.delete('/', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((payload) => {
			let friendID = req.body.friendID;

			if (payload.id === friendID) {
				next(new Error('Invalid FriendID'));
			} else {
				friend.unfriend(payload.id, friendID)
				.then((results) => res.json({ results: results }))
				.catch((err) => next(err));
			}
		})
		.catch((err) => next(err));
	}
});

module.exports = router;