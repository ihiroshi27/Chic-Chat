const express = require('express');

const token = require('../token');
const chat = require('../model/chat');

const router = express.Router();

router.get('/:friendID', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((payload) => {
			let friendID = req.params.friendID;
			chat.find(payload.id, friendID)
			.then((rows) => res.json({ chat: rows }))
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
			let message = req.body.message;

			chat.create(payload.id, friendID, message)
			.then((results) => {
				res.json({ results: results });

				if (req.listener.forEach((listen) => {
					if (listen.userID === friendID && listen.friendID === payload.id) {
						req.io.to(listen.clientID).emit('new');
					}
				}));
			})
			.catch((err) => next(err));
		})
		.catch((err) => {
			next(err);
		});
	}
});

module.exports = router;