const https = require('https');
const express = require('express');
const multer  = require('multer');
const bcrypt = require('bcrypt');

const config = require('../config');
const token = require('../token');
const user = require('../model/user');
const login = require('../model/login');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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

router.get('/', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((payload) => {
			user.getByID(payload.id)
			.then((rows) => {
				delete(rows[0].password);
				res.json({ user: rows[0] })
			})
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	}
});

router.post('/', upload.single('file'), function(req, res, next) {
	let username = req.body.username;
	let password = bcrypt.hashSync(req.body.password, config.security.saltRounds);
	let name = req.body.name;
	let email = req.body.email;
	let mobile = req.body.mobile;
	let citizenID = req.body.citizen_id;
	let profile = req.file.filename;
	let mimetype = req.file.mimetype;

	user.create(username, password, name, email, mobile, citizenID, profile, mimetype)
	.then((results) => {
		token.encode({ id: results.insertId }, password)
		.then((token) => {
			let ip = req.ip;
			getLocationFromIP(ip)
			.then((location) => {
				login.create(results.insertId, 'Success', location.latitude, location.longitude)
				.then((results) => {
					res.json({ token: token });
				})
				.catch((err) => next(err));
			})
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	})
	.catch((err) => next(err));
});

router.put('/', upload.single('file'), function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((payload) => {
			let name = req.body.name;
			let email = req.body.email;
			let mobile = req.body.mobile;
			let citizenID = req.body.citizen_id;

			let update = [
				"name = '" + name + "'",
				"email = '" + email + "'",
				"mobile = '" + mobile + "'",
				"citizen_id = '" + citizenID + "'"
			]
			if (req.file) {
				let profile = req.file.filename;
				let mimetype = req.file.mimetype;
				update = update.concat([
					"profile = '" + profile + "'",
					"mimetype = '" + mimetype + "'"
				]);
			}
			user.updateByID(payload.id, update)
			.then((results) => res.json({ results: "Complete" }))
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	}
});

router.get('/login-history', function(req, res, next) {
	if (typeof req.headers.authorization === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.headers.authorization.replace('Bearer ', ''))
		.then((user) => {
			login.find(user.id)
			.then((rows) => res.json({ results: rows }))
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	}
});

module.exports = router;