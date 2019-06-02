const express = require('express');

const token = require('../token');
const { sequelize, Op, User, Friend } = require('../db');

const router = express.Router();

router.get('/', function(req, res, next) {
	let query = req.query.q;
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		if (!query.trim()) {
			res.json({ friends: [] });
		} else {
			token.decode(req.headers.authorization.replace('Bearer ', ''))
			.then((user) => {
				let userID = user.id;
				User.findAll({ 
					attributes: [
						'id',
						'name',
						'username',
						'profile'
					],
					where: {
						id: { [Op.not]: userID },
						[Op.or]: [
							{ name: { [Op.like]: '%' + query + '%' } },
							{ username: { [Op.like]: '%' + query + '%' } },
							{ email: { [Op.like]: '%' + query + '%' } },
							{ mobile: { [Op.like]: '%' + query + '%' } }
						]
					},
					raw: true
				})
				.then((users) => {
					let results = users.map(async (user, index) => {
						let friend = await Friend.findOne({
							attributes: [
								'user_id',
								'friend_id',
								'blocked',
								[sequelize.col('friendship.blocked'), "being_blocked"]
							],
							where: { 
								user_id: userID, 
								friend_id: user.id 
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
						});
						if (friend) {
							if (friend.blocked === true) {
								users[index].friended = "BLOCK";
							} else {
								if (friend.being_blocked === null) {
									users[index].friended = "PENDING";
								} else {
									users[index].friended = "YES";
								}
							}
						} else {
							users[index].friended = "NO";
						}
					});
					Promise.all(results).then((friends) => {
						res.json({
							friends: users.filter((user) => { return user.friended !== "BLOCK"; })
						})
					});
				})
				.catch((err) => next(err));
			})
			.catch((err) => next(err));
		}
	}
});

module.exports = router;