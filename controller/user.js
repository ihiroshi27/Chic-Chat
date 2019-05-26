const https = require('https');
const express = require('express');
const multer  = require('multer');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');

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

router.get('/login-history/:type', function(req, res, next) {
	if (typeof req.query.token === "undefined") {
		next(new Error('Invalid Token'));
	} else {
		token.decode(req.query.token)
		.then((user) => {
			login.find(user.id)
			.then((rows) => {
				switch(req.params.type) {
					case 'csv':
						let data = [
							'Datetime, Success/Failed, Latitude, Longitude',
							rows.map((row) => {
								let date = new Date(row.dateadded);
								return (
									[
										date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
										row.attempt,
										row.lat,
										row.lng
									]
								);
							}).join("\n")
						].join("\n");
						res.attachment('login-history.csv');
						res.status(200).send(data);
						break;
					case 'pdf':
						const doc = new PDFDocument;
						res.attachment('login-history.pdf');
						doc.fontSize(16).text('Chic Chat Login History', { align: 'center' });
						doc.moveDown();
						rows.forEach((row) => {
							let date = new Date(row.dateadded);
							doc.fontSize(14)
								.fillColor('#898989')
								.text('Datetime: ', { continued: true })
								.fillColor('#000000')
								.text([date.toLocaleDateString(), date.toLocaleTimeString()].join(' '));
							doc.fontSize(14)
								.fillColor('#898989')
								.text('Attempt: ', { continued: true })
								.fillColor(row.attempt === "Success" ? "#8cb203" : '#d62e0c')
								.text(row.attempt);
								doc.fontSize(14)
								.fillColor('#898989')
								.text('Location: ', { continued: true })
								.fillColor('#000000')
								.text([row.lat, row.lng].join(', '));
							doc.moveDown();
						});
						doc.pipe(res);
						doc.end();
						break;
				}
			})
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	}
});

module.exports = router;