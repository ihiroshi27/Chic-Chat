const https = require('https');
const express = require('express');
const multer  = require('multer');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');

const config = require('../config');
const token = require('../token');
const { User, Login } = require('../db');

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
			User.findOne({ where: { id: payload.id }})
			.then((user) => {
				delete(user.password);
				res.json({ user: user })
			})
			.catch((err) => next(err));
		})
		.catch((err) => next(err));
	}
});

router.post('/', upload.single('file'), function(req, res, next) {
	if (req.body && req.file) {
		req.body.password = bcrypt.hashSync(req.body.password, config.security.saltRounds);
		req.body.profile = req.file.filename;
		User.create(req.body)
		.then((result) => {
			token.encode({ id: result.id }, req.body.password)
			.then((token) => {
				let ip = req.ip;
				getLocationFromIP(ip)
				.then((location) => {
					let login = {
						user_id: result.id,
						attempt: 'Success',
						lat: location.latitude,
						lng: location.longitude
					}
					Login.create(login)
					.then((result) => {
						res.json({ token: token });
					})
					.catch((err) => next(err));
				})
				.catch((err) => next(err));
			});
		})
		.catch((err) => next(err));
	}
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

			let update = {
				name: name,
				email: email,
				mobile: mobile,
				citizen_id: citizenID
			}
			if (req.file) {
				update.profile = req.file.filename;
			}

			User.update(update, { where: { id: payload.id } })
			.then((result) => res.json({ result: "Complete" }))
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
			Login.findAll({ 
				where: { user_id: user.id },
				order: [["created_at", "DESC"]]
			})
			.then((results) => res.json({ results: results }))
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
			Login.findAll({ 
				where: { user_id: user.id },
				order: [["created_at", "DESC"]]
			})
			.then((rows) => {
				switch(req.params.type) {
					case 'csv':
						let data = [
							'Datetime, Success/Failed, Latitude, Longitude',
							rows.map((row) => {
								let date = new Date(row.createdAt);
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
							let date = new Date(row.createdAt);
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