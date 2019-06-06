const express = require('express');
const https = require("https");
const bcrypt = require('bcrypt');

const config = require('../config');
const token = require('../token');
const { User, Login } = require('../db');

const router = express.Router();

function checkRecaptcha(token) {
	return new Promise(function(resolve, reject) {
		const options = {
			method: "POST",
			port: 443,
			hostname: "www.google.com",
			path: "/recaptcha/api/siteverify",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}
		}
		const body = [
			"secret=" + config.recaptcha.secret,
			"response=" + token
		].join("&");
		const request = https.request(options, (res) => {
			var chunks = [];
			res.on("data", function (chunk) {
				chunks.push(chunk);
			});
			res.on("end", function () {
				var body = JSON.parse(Buffer.concat(chunks));
				resolve(body);
			});
		});
		request.on("error", (err) => reject(err));
		request.write(body);
		request.end();
	});
}

function getLocationFromIP(ip) {
	return new Promise(function(resolve, reject) {
		const options = {
			method: "GET",
			port: 443,
			hostname: "freegeoip.app",
			path: "/json/" + (ip !== "127.0.0.1" ? ip : ""),
			headers: {
				"Content-Type": "application/json"
			}
		}
		const request = https.request(options, (res) => {
			var chunks = [];
			res.on("data", function (chunk) {
				chunks.push(chunk);
			});
			res.on("end", function () {
				try {
					let body = JSON.parse(Buffer.concat(chunks));
					resolve(body);
				} catch (err) {
					reject(err);
				}
			});
		});
		request.on("error", (err) => { reject(err) })
		request.end();
	});
}

router.post('/', function(req, res, next) {
	let recaptcha = req.body.recaptcha;
	if (!recaptcha) {
		next();
	} else {
		checkRecaptcha(recaptcha)
		.then((response) => {
			if (!response.success) {
				next(new Error("Invalid reCAPTCHA"));
			} else {
				next();
			}
		})
		.catch((err) => next(err));
	}
});

router.post('/', function(req, res, next) {
	let username = req.body.username;
	let password = req.body.password;

	User.findOne({ where: { username: username } })
	.then((user) => {
		if (!user) {
			next(new Error("Incorrect Username"));
		} else {
			if (req.body.latitude && req.body.longitude) {
				if (!bcrypt.compareSync(password, user.password)) {
					let login = {
						user_id: user.id,
						attempt: 'Failed',
						lat: req.body.latitude,
						lng: req.body.longitude
					}
					Login.create(login)
					.then((result) => {
						next(new Error("Incorrect Password"));
					})
					.catch((err) => next(err));
				} else {
					let login = {
						user_id: user.id,
						attempt: 'Success',
						lat: req.body.latitude,
						lng: req.body.longitude
					}
					Login.create(login)
					.then((result) => {
						token.encode({ id: user.id }, user.password)
						.then((token) => {
							res.json({ token: token });
						})
						.catch((err) => next(err));
					})
					.catch((err) => next(err));
				}
			} else {
				let ip = req.ip;
				getLocationFromIP(ip)
				.then((location) => {
					if (!bcrypt.compareSync(password, user.password)) {
						let login = {
							user_id: user.id,
							attempt: 'Failed',
							lat: location.latitude,
							lng: location.longitude
						}
						Login.create(login)
						.then((result) => {
							next(new Error("Incorrect Password"));
						})
						.catch((err) => next(err));
					} else {
						let login = {
							user_id: user.id,
							attempt: 'Success',
							lat: location.latitude,
							lng: location.longitude
						}
						Login.create(login)
						.then((result) => {
							token.encode({ id: user.id }, user.password)
							.then((token) => {
								res.json({ token: token });
							})
							.catch((err) => next(err));
						})
						.catch((err) => next(err));
					}
				})
				.catch((err) => next(err));
			}
		} 
	});
});

module.exports = router;