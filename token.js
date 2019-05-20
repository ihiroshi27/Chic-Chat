const CryptoJS = require("crypto-js");

const config = require('./config');

function escapeBase64Url(key) {
	return key.replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function unescapeBase64Url(key) {
	return key.replace(/-/g, '+').replace(/_/g, '/');
}

exports.encode = function(payload) {
	let header = { typ: "JWT", alg: "HS256" };
	let data = [
		escapeBase64Url(Buffer.from(JSON.stringify(header)).toString('base64')), 
		escapeBase64Url(Buffer.from(JSON.stringify(payload)).toString('base64'))
	].join(".");
	let signature = escapeBase64Url(
		CryptoJS.HmacSHA256(
			data, 
			config.app.secret
		).toString(CryptoJS.enc.Base64)
	);
	return data + '.' + signature;
}

exports.decode = function(token) {
	let data = token.split(".");
	let signature = escapeBase64Url(
		CryptoJS.HmacSHA256(
			[data[0], data[1]].join('.'), 
			config.app.secret
		).toString(CryptoJS.enc.Base64)
	);
	if (signature !== data[2]) {
		throw new Error("Invalid Token");
	}
	let payload = Buffer.from(
			unescapeBase64Url(data[1]), 
			'base64'
		).toString();
	return JSON.parse(payload);
}