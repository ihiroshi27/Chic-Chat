const https = require('https');
const express = require('express');
const multer  = require('multer');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');

const config = require('../config');
const token = require('../token');
const { sequelize, Op, User, Login, Friend } = require('../db');

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

		let latitude = req.body.latitude;
		let longitude = req.body.longitude;
		delete(req.body.latitude);
		delete(req.body.longitude);

		User.create(req.body)
		.then((result) => {
			token.encode({ id: result.id }, req.body.password)
			.then((token) => {
				if (latitude && longitude) {
					let login = {
						user_id: result.id,
						attempt: 'Success',
						lat: latitude,
						lng: longitude
					}
					Login.create(login)
					.then((result) => {
						res.json({ token: token });
					})
					.catch((err) => next(err));
				} else {
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
				}
			})
			.catch((err) => next(err));
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

router.get('/search', function(req, res, next) {
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
							include: [
								{
									attributes: [],
									model: Friend,
									as: 'friendship',
									where: {
										friend_id: userID
									},
									required: false
								}
							],
							where: { 
								user_id: userID,
								friend_id: user.id
							},
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