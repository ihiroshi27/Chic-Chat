const config = {
	app: {
		hostname: '0.0.0.0',
		port: 8080
	},
	view: {
		url: "http://localhost:3000"
	},
	security: {
		expiredDate: 30,
		secret: "secretkey",
		saltRounds: 10
	},
	recaptcha: {
		secret: ""
	},
	db: {
		host: "localhost",
		user: "root",
		password: "",
		database: "chic_chat"
	},
	mail: {
		service: '',
		auth: {
			user: '',
			pass: ''
		}
	}
}

module.exports = config;