const express = require('express');
const bcrypt = require('bcrypt');

const token = require('../token');
const user = require('../model/user');

const router = express.Router();

router.post('/', function(req, res, next) {
	let username = req.body.username;
	let password = req.body.password;

	user.getByUsername(username).then((rows) => {
		if (rows.length !== 1) {
			next(new Error("Incorrect Username"));
		} else if (!bcrypt.compareSync(password, rows[0].password)) {
			next(new Error("Incorrect Password"))
		} else {
			token.encode({ id: rows[0].id }, rows[0].password)
			.then((token) => {
				res.json({ token: token });
			})
			.catch((err) => next(err));
		}
	});
});

module.exports = router;