const express = require('express');
const crypto = require('crypto'); 
const bcrypt = require('bcrypt');
const ejs = require("ejs");

const config = require('../config');
const mail = require('../mail');

const { User, Reset } = require('../db');

const router = express.Router();

function escapeBase64Url(key) {
	return key.replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

router.get('/:token', function(req, res, next) {
	let token = req.params.token;
	Reset.findOne({ where: { token: token } })
	.then((reset) => {
		if (!reset) {
			next(new Error('Invalid Token'));
		} else {
			res.json({ status: "OK" })
		}
	})
	.catch((err) => next(err));
});

router.post('/', function(req, res, next) {
	let email = req.body.email;
	User.findOne({ where: { email: email } })
	.then((user) => {
		if (!user) next(new Error('Invalid Email'));
		else {
			let resetToken = escapeBase64Url(crypto.randomBytes(16).toString('base64'));
			Reset.create({
				token: resetToken,
				user_id: user.id,
				email: email
			})
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

router.put("/:token", function(req, res, next) {
	let token = req.params.token;
	let password = bcrypt.hashSync(req.body.password, config.security.saltRounds);

	Reset.findOne({ where: { token: token } })
	.then((reset) => {
		if (!reset) {
			next(new Error('Invalid Token'));
		} else {
			let userID = reset.user_id;
			User.update({ password: password }, { where: { id: userID } })
			.then((result) => {
				Reset.destroy({ where: { token: token } })
				.then((result) => {
					res.json({ result: "Complete" });
				})
				.catch((err) => next(err));
			})
			.catch((err) => next(err));
		}
	})
	.catch((err) => next(err));
});

module.exports = router;