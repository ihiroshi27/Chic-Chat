const express = require('express');

const token = require('../token');
const { Op, User, Friend } = require('../db');

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
					where: {
						id: { [Op.not]: userID },
						[Op.or]: [
							{ name: { [Op.like]: '%' + query + '%' } },
							{ username: { [Op.like]: '%' + query + '%' } },
							{ email: { [Op.like]: '%' + query + '%' } },
							{ mobile: { [Op.like]: '%' + query + '%' } }
						]
					}
				})
				.then((users) => {
					let results = users.map(async (user, index) => {
						let friend = await Friend.findOne({ where: { user_id: userID, friend_id: user.id  } });
						if (friend) {
							users[index].friended = "YES"
						} else {
							users[index].friended = "NO"
						}
					});
					Promise.all(results).then((friends) => {
						res.json({
							friends: users.map((user) => ({
								id: user.id,
								name: user.name,
								username: user.username,
								profile: user.profile,
								friended: user.friended
							}))
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