const db = require('../db');

exports.create = function(userID, email, token) {
	return new Promise(function(resolve, reject) {
		db.query("INSERT INTO reset (user_id, email, token) VALUES ('" + userID + "', '" + email + "', '" + token + "')", function(err, results) {
			if (err) reject(err);
			else resolve(results);
		});
	});
}

exports.findByToken = function(token) {
	return new Promise(function(resolve, reject) {
		db.query("SELECT * FROM reset WHERE token = '" + token + "'", function(err, rows) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}

exports.remove = function(token) {
	return new Promise(function(resolve, reject) {
		db.query("DELETE FROM reset WHERE token = '" + token + "'", function(err, results) {
			if (err) reject(err);
			else resolve(results);
		});
	});
}