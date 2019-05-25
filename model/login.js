const db = require('../db');

exports.create = function(userID, attempt, lat, lng) {
	return new Promise(function(resolve, reject) {
		db.query("INSERT INTO login (user_id, attempt, lat, lng) VALUES ('" + userID + "', '" + attempt + "', '" + lat + "', '" + lng + "')", function(err, results) {
			if (err) reject(err);
			else resolve(results);
		});
	});
}