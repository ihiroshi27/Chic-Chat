const express = require('express');

const token = require('../token');
const { Op, Friend, Chat, Notification } = require('../db');

const router = express.Router();

router.get('/:friendID', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((user) => {
			let friendID = req.params.friendID;
			Chat.findAll({ 
				where: {
					[Op.or]: [
						{ user_id1: user.id, user_id2: friendID },
						{ user_id1: friendID, user_id2: user.id },
					]
				},
				order: [['created_at', 'ASC']]
			})
			.then((chat) => res.json({ chat: chat }))
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

			Friend.findOne({ 
				where: { 
					user_id: friendID, 
					friend_id: userID 
				},
				raw: true 
			})
			.then((friend) => {
				if (!friend) {
					next(new Error("You are not his friend"));
				} else if (friend.blocked) {
					next(new Error("You have been blocked"));
				} else {
					const message = req.body.message;
					Promise.all([
						Chat.create({
							user_id1: userID,
							user_id2: friendID,
							message: message
						}),
						Notification.upsert({
							type: 'Message',
							user_id: friendID,
							friend_id: userID,
							message: message,
							readed: false
						})
					])
					.then((result) => {
						res.json({ result: "Complete" });
		
						if (req.listener.forEach((listen) => {
							if (listen.userID === friendID && listen.friendID === userID) {
								req.io.to(listen.clientID).emit('new');
							}
						}));
					})
					.catch((err) => next(err));
				}
			})
			.catch((err) => next(err));
		})
		.catch((err) => {
			next(err);
		});
	}
});

module.exports = router;