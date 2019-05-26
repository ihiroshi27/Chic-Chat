const db = require('../db');

exports.create = function(userID, attempt, lat, lng) {
	return new Promise(function(resolve, reject) {
		db.query("INSERT INTO login (user_id, attempt, lat, lng) VALUES ('" + userID + "', '" + attempt + "', '" + lat + "', '" + lng + "')", function(err, results) {
			if (err) reject(err);
			else resolve(results);
		});
	});
}

exports.find = function(userID) {
	return new Promise(function(resolve, reject) {
		db.query("SELECT * FROM login WHERE user_id = '" + userID + "' ORDER BY dateadded DESC", (err, rows) => {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}