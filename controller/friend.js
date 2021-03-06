const express = require('express');

const token = require('../token');
const { sequelize, User, Friend, Notification } = require('../db');

const router = express.Router();

router.get('/', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((payload) => {
			Friend.findAll({
				attributes: [
					'user_id',
					'friend_id', 
					[sequelize.col('friendship.blocked'), "being_blocked"] 
				],
				include: [
					{
						attributes: [],
						model: Friend,
						as: 'friendship',
						where: {
							friend_id: payload.id
						},
						required: false
					}
				],
				where: { 
					user_id: payload.id,
					blocked: false
				},
				raw: true
			})
			.then((friends) => {
				let results = friends
				.map(async (friend, index) => {
					let user = await User.findOne({ where: { id: friend.friend_id } });
					friends[index].id = user.id;
					friends[index].name = user.name;
					friends[index].profile = user.profile;
				});
				Promise.all(results).then((users) => {
					res.json({ friends: friends.filter((friend) => friend.being_blocked !== null) });
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
		.then((user) => {
			let userID = user.id;
			let friendID = req.body.friendID;

			if (userID === friendID) {
				next(new Error('Invalid FriendID'));
			} else {
				Friend.findOne({
					where: {
						user_id: friendID,
						friend_id: userID,
						blocked: true
					}
				})
				.then((friend) => {
					if (friend) {
						next(new Error('You have been blocked'));
					} else {
						Friend.findOne({
							where: {
								user_id: friendID,
								friend_id: userID,
								blocked: false
							}
						})
						.then((friend) => {
							if (friend) { // Accept Friend Request
								Promise.all([
									Friend.create({
										user_id: userID,
										friend_id: friendID
									}),
									Notification.destroy({
										where: {
											type: 'Request',
											user_id: userID,
											friend_id: friendID
										}
									})
								])
								.then((result) => res.json({ result: "Complete" }))
								.catch((err) => next(err));
							} else { // Send Friend Request
								Promise.all([
									Friend.create({
										user_id: userID,
										friend_id: friendID
									}),
									Notification.create({
										type: 'Request',
										user_id: friendID,
										friend_id: userID
									}),
									Notification.destroy({
										where: {
											type: 'Request',
											user_id: userID,
											friend_id: friendID
										}
									})
								])
								.then((result) => {
									res.json({ result: "Complete" });
									req.socketIO.notification.listener.forEach((listen) => {
										if (listen.listenerID === friendID) {
											req.socketIO.notification.io.to(listen.clientID).emit('update');
										}
									});
								})
								.catch((err) => next(err));
							}
						})
						.catch((err) => next(err));
					}
				})
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
					Friend.destroy({ 
						where: {
							user_id: userID,
							friend_id: friendID,
							blocked: false
						}
					}),
					Friend.destroy({ 
						where: {
							user_id: friendID,
							friend_id: userID,
							blocked: false
						}
					}),
					Notification.destroy({
						where: {
							user_id: friendID,
							friend_id: userID
						}
					}),
					Notification.destroy({
						where: {
							user_id: userID,
							friend_id: friendID
						}
					})
				])
				.then((result) => {
					res.json({ result: "Complete" });
					req.socketIO.notification.listener.forEach((listen) => {
						if (listen.listenerID === friendID) {
							req.socketIO.notification.io.to(listen.clientID).emit('update');
						}
					});
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