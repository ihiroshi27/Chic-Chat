const db = require('../db');

exports.create = function(username, password, name, email, mobile, citizenID, profile, mimetype) {
	return new Promise(function(resolve, reject) {
		db.query("INSERT INTO user (username, password, name, email, mobile, citizen_id, profile, mimetype) VALUES ('" + username + "', '" + password + "', '" + name + "', '" + email + "', '" + mobile + "', '" + citizenID + "', '" + profile + "', '" + mimetype + "')", function(err, results) {
			if (err) reject(err);
			else resolve(results);
		});
	});
}

exports.getByID = function(id) {
	return new Promise(function(resolve, reject) {
		db.query("SELECT * FROM user WHERE id = '" + id + "'", function(err, rows) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
};

exports.getByUsername = function(username) {
	return new Promise(function(resolve, reject) {
		db.query("SELECT * FROM user WHERE username = '" + username + "'", function(err, rows) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}

exports.getByEmail = function(email) {
	return new Promise(function(resolve, reject) {
		db.query("SELECT * FROM user WHERE email = '" + email + "'", function(err, rows) {
			if (err) reject(err);
			else resolve(rows[0]);
		});
	});
}

exports.updateByID = function(id, update) {
	return new Promise(function(resolve, reject) {
		db.query("UPDATE user SET " + update + " WHERE id = '" + id + "'", function(err, rows) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
};

exports.find = function(userID, query) {
	return new Promise(function(resolve, reject) {
		db.query("SELECT *, IF (friend.friend_id = user.id, 'YES', 'NO') as friended FROM user LEFT JOIN friend ON friend.user_id = '" + userID + "' AND friend.friend_id = user.id WHERE id <> '" + userID + "' AND (name LIKE '%" + query + "%' OR username LIKE '%" + query + "%' OR email LIKE '%" + query + "%' OR mobile LIKE '%" + query + "%') ORDER BY user.id DESC", function(err, rows) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
};