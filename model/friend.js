const db = require('../db');

exports.add = function(userID, friendID) {
	return new Promise(function(resolve, reject) {
		db.query("INSERT INTO friend (user_id, friend_id) VALUES ('" + userID + "', '" + friendID + "')", function(err, results) {
			if (err) reject(err);
			else resolve(results);
		});
	});
}

exports.unfriend = function(userID, friendID) {
	return new Promise(function(resolve, reject) {
		db.query("DELETE FROM friend WHERE user_id = '" + userID + "' AND friend_id = '" + friendID + "'", function(err, results) {
			if (err) reject(err);
			else resolve(results);
		});
	});
}

exports.find = function(userID) {
	return new Promise(function(resolve, reject) {
		db.query("SELECT * FROM friend INNER JOIN user ON user.id = friend.friend_id WHERE friend.user_id = '" + userID + "'", function(err, rows) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}