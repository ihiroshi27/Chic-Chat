const CryptoJS = require("crypto-js");

const config = require('./config');
const user = require('./model/user');

function escapeBase64Url(key) {
	return key.replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function unescapeBase64Url(key) {
	return key.replace(/-/g, '+').replace(/_/g, '/');
}

exports.encode = function(payload, password) {
	return new Promise(function(resolve, reject) {
		let header = { typ: "JWT", alg: "HS256" };
		let data = [
			escapeBase64Url(Buffer.from(JSON.stringify(header)).toString('base64')), 
			escapeBase64Url(Buffer.from(JSON.stringify(payload)).toString('base64'))
		].join(".");
		let signature = escapeBase64Url(
			CryptoJS.HmacSHA256(
				data,
				config.app.secret + password
			).toString(CryptoJS.enc.Base64)
		);
		resolve(data + '.' + signature);
	});
}

exports.decode = function(token) {
	return new Promise(function(resolve, reject) {
		let data = token.split(".");
		let header = data[0];
		let payload = data[1];
		let signature = data[2];
		let payloadParser = JSON.parse(Buffer.from(unescapeBase64Url(payload), 'base64').toString());
		let id = payloadParser.id;
		user.getByID(id)
		.then((rows) => {
			if (rows.length !== 1) {
				reject('Invalid Token');
			} else {
				let password = rows[0].password;
				let signatureCheck = escapeBase64Url(
					CryptoJS.HmacSHA256(
						[header, payload].join('.'),
						config.app.secret + password
					).toString(CryptoJS.enc.Base64)
				);
				if (signatureCheck !== signature) {
					reject('Invalid Token');
				}
				resolve(JSON.parse(Buffer.from(unescapeBase64Url(payload), 'base64').toString()));
			}
		})
		.catch((err) => { throw err });
	});
}