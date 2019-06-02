const express = require('express');

const token = require('../token');
const { sequelize, User, Friend } = require('../db');

const router = express.Router();

router.get('/', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((payload) => {
			Friend.findAll({
				attributes: [ 'user_id', 'friend_id', [sequelize.col('friendship.blocked'), "being_blocked"] ],
				where: { 
					user_id: payload.id,
					blocked: false
				},
				include: [
					{
						attributes: [],
						model: Friend,
						as: 'friendship',
						require: false
					}
				],
				raw: true
			})
			.then((friends) => {
				let results = friends.map(async (friend, index) => {
					let user = await User.findOne({ where: { id: friend.friend_id } });
					friends[index].id = user.id;
					friends[index].name = user.name;
					friends[index].profile = user.profile;
				});
				Promise.all(results).then((users) => {
					res.json({ friends: friends });
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
		.then((user) => {
			let userID = user.id;
			let friendID = req.body.friendID;
			if (userID === friendID) {
				next(new Error('Invalid FriendID'));
			} else {
				Promise.all([
					Friend.destroy({ where: {
						user_id: userID,
						friend_id: friendID,
						blocked: false
					}}),
					Friend.destroy({ where: {
						user_id: friendID,
						friend_id: userID,
						blocked: false
					}})
				])
				.then((result) => {
					res.json({ result: "Complete" });
				})
				.catch((err) => next(err));
			}
		})
		.catch((err) => next(err));
	}
});

router.post('/block', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((user) => {
			let friendID = req.body.friendID;
			let query = {
				where: {
					user_id: user.id,
					friend_id: friendID
				}
			}
			Friend.findOne({ query, raw: true })
			.then((friend) => {
				if (friend) {
					Friend.update({ blocked: true }, query)
					.then((result) => {
						res.json({ result: "Complete" });
					})
					.catch((err) => next(err));
				} else {
					query.blocked = true;
					Friend.create(query)
					.then((result) => {
						res.json({ result: "Complete" });
					})
					.catch((err) => next(err));
				}
			})
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	}
});

router.get('/blocking', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((user) => {
			Friend.findAll({
				where: { 
					user_id: user.id,
					blocked: true
				},
				raw: true
			})
			.then((blocking) => {
				let results = blocking.map(async (block, index) => {
					let user = await User.findOne({ where: { id: block.friend_id } });
					blocking[index].id = user.id;
					blocking[index].name = user.name;
					blocking[index].username = user.username;
					blocking[index].profile = user.profile;
				});
				Promise.all(results).then((users) => {
					res.json({ blocking: blocking });
				});
			})
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	}
});

router.put('/unblock', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((user) => {
			let friendID = req.body.friendID;
			Friend.update({ blocked: false }, {
				where: {
					user_id: user.id,
					friend_id: friendID
				}
			})
			.then((result) => {
				res.json({ result: "Complete" });
			})
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	}
});

module.exports = router;