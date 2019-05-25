const express = require('express');
const https = require("https");
const bcrypt = require('bcrypt');

const config = require('../config');
const token = require('../token');
const user = require('../model/user');
const login = require('../model/login');

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
				var body = JSON.parse(Buffer.concat(chunks));
				resolve(body);
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

	user.getByUsername(username).then((rows) => {
		if (rows.length !== 1) {
			next(new Error("Incorrect Username"));
		} else {
			let user = rows[0];
			let ip = req.ip;
			getLocationFromIP(ip)
			.then((location) => {
				if (!bcrypt.compareSync(password, user.password)) {
					login.create(user.id, 'Failed', location.latitude, location.longitude)
					.then((results) => {
						next(new Error("Incorrect Password"));
					})
					.catch((err) => next(err));
				} else {
					login.create(user.id, 'Success', location.latitude, location.longitude)
					.then((results) => {
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
	});
});

module.exports = router;