const express = require('express');

const token = require('../token');
const { sequelize, Notification, User } = require('../db');

const router = express.Router();

router.get('/', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((user) => {
			let userID = user.id;
			Notification.findAll({
				attributes: [
					'type',
					'user_id',
					'friend_id',
					[sequelize.col('friend.name'), "friend_name"],
					[sequelize.col('friend.profile'), "friend_profile"],
					'message',
					'readed',
					'created_at',
					'updated_at'
				],
				where: {
					user_id: userID
				},
				include: [{
					attributes: [],
					model: User,
					as: 'friend'
				}],
				order: [["updated_at", "DESC"]],
				raw: true
			})
			.then((notification) => {
				res.json({ notification: notification });
			})
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	}
});

router.put('/allread', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((user) => {
			let userID = user.id;
			Notification.update({ readed: true }, { 
				where: {
					type: 'Message',
					user_id: userID 
				}, 
				silent: true
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