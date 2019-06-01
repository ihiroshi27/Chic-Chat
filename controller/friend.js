const express = require('express');

const token = require('../token');
const { User, Friend } = require('../db');

const router = express.Router();

router.get('/', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((payload) => {
			Friend.findAll({ where: { user_id: payload.id } })
			.then((friends) => {
				let results = friends.map(async (friend) => {
					return User.findOne({ where: { id: friend.friend_id } });
				});
				Promise.all(results).then((users) => {
					res.json({
						friends: users.map((user) => {
							return {
								id: user.id,
								name: user.name,
								profile: user.profile
							}
						})
					})
				});
			})
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
				Friend.create({
					user_id: payload.id,
					friend_id: friendID
				})
				.then((result) => res.json({ result: "Complete" }))
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
				Friend.destroy({ where: {
					user_id: payload.id,
					friend_id: friendID
				}})
				.then((result) => res.json({ result: "Complete" }))
				.catch((err) => next(err));
			}
		})
		.catch((err) => next(err));
	}
});

module.exports = router;