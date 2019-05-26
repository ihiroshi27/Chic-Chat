const express = require('express');
const crypto = require('crypto'); 
const bcrypt = require('bcrypt');
const ejs = require("ejs");

const config = require('../config');
const mail = require('../mail');

const reset = require('../model/reset');
const user = require('../model/user');

const router = express.Router();

function escapeBase64Url(key) {
	return key.replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

router.get('/', function(req, res, next) {
	res.json({ 'test': 'test' });
});

router.post('/', function(req, res, next) {
	let email = req.body.email;
	user.getByEmail(email)
	.then((user) => {
		if (!user) next(new Error('Invalid Email'));
		else {
			let resetToken = escapeBase64Url(crypto.randomBytes(16).toString('base64'));
			reset.create(user.id, email, resetToken)
			.then((results) => {
				ejs.renderFile(__dirname + "/../template/passwordResetEmail.ejs", {
					name: user.name,
					email: email,
					link: config.view.url + '/reset-password?token=' + resetToken
				}, (err, html) => {
					if (err) next(err);
					else {
						var mailOptions = {
							from: config.mail.auth.user,
							to: email,
							subject: 'Reset your Chic-Chat password',
							html: html
						};
						mail.sendMail(mailOptions, (err, info) => {
							if (err) next(err);
							else res.json({ results: "Complete" })
						});
					}
				});
			})
			.catch((err) => next(err));
		}
	})
	.catch((err) => next(err));
});

router.put("/", function(req, res, next) {
	let token = req.query.token;
	let password = bcrypt.hashSync(req.body.password, config.security.saltRounds);

	reset.findByToken(token)
	.then((rows) => {
		if (rows.length === 0) {
			next(new Error("Invalid Token"));
		} else {
			let userID = rows[0].user_id;
			let update = ["password = '" + password + "'"];
			user.updateByID(userID, update)
			.then((results) => {
				reset.remove(token)
				.then((results) => {
					res.json({ results: "Complete" });
				})
				.catch((err) => next(err));
			})
			.catch((err) => next(err));
		}
	})
	.catch((err) => next(err));
});

module.exports = router;