const CryptoJS = require("crypto-js");

const config = require('./config');
const { User } = require('./db');

function escapeBase64Url(key) {
	return key.replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function unescapeBase64Url(key) {
	return key.replace(/-/g, '+').replace(/_/g, '/');
}

exports.encode = function(payload, password) {
	return new Promise(function(resolve, reject) {
		let exp = new Date();
		exp.setDate(exp.getDate() + config.security.expiredDate);
		payload.exp = exp;

		let header = { typ: "JWT", alg: "HS256" };
		let data = [
			escapeBase64Url(Buffer.from(JSON.stringify(header)).toString('base64')), 
			escapeBase64Url(Buffer.from(JSON.stringify(payload)).toString('base64'))
		].join(".");
		let signature = escapeBase64Url(
			CryptoJS.HmacSHA256(
				data,
				config.security.secret + password
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
		let exp = payloadParser.exp;

		if (new Date() > new Date(exp)) {
			reject(new Error('Token Expired'));
		} else {
			User.findOne({ where: { id: id } })
			.then((user) => {
				if (!user) {
					reject(new Error('Invalid Token'));
				} else {
					let password = user.password;
					let signatureCheck = escapeBase64Url(
						CryptoJS.HmacSHA256(
							[header, payload].join('.'),
							config.security.secret + password
						).toString(CryptoJS.enc.Base64)
					);
					if (signatureCheck !== signature) {
						reject(new Error('Invalid Token'));
					}
					resolve(JSON.parse(Buffer.from(unescapeBase64Url(payload), 'base64').toString()));
				}
			})
			.catch((err) => { throw err });
		}
	});
}