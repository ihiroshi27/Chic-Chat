const express = require('express');
const multer  = require('multer')

const bcrypt = require('bcrypt');
const saltRounds = 10;

const token = require('../token');
const user = require('../model/user');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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
	let password = bcrypt.hashSync(req.body.password, saltRounds);
	let name = req.body.name;
	let email = req.body.email;
	let mobile = req.body.mobile;
	let citizenID = req.body.citizen_id;
	let profile = req.file.filename;
	let mimetype = req.file.mimetype;

	user.create(username, password, name, email, mobile, citizenID, profile, mimetype)
	.then((results) => res.json({ token: token.encode({ id: results.insertId }, password) }))
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

module.exports = router;