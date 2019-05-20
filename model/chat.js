const db = require('../db');

exports.create = function(userID, friendID, message) {
	return new Promise(function(resolve, reject) {
		db.query("INSERT INTO chat (user_id1, user_id2, message) VALUES ('" + userID + "', '" + friendID + "', '" + message + "')", function(err, results) {
			if (err) reject(err);
			else resolve(results);
		});
	});
}

exports.find = function(userID, friendID) {
	return new Promise(function(resolve, reject) {
		db.query("SELECT * FROM chat WHERE (user_id1 = '" + userID + "' AND user_id2 = '" + friendID + "') OR (user_id1 = '" + friendID + "' AND user_id2 = '" + userID + "') ORDER BY dateadded ASC", function(err, rows) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}