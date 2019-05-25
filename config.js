const config = {
	app: {
		port: 8080,
		secret: "secret"
	},
	view: {
		url: "http://localhost:3000"
	},
	db: {
		host: "localhost",
		user: "root",
		password: "",
		database: "chic_chat"
	},
	email: {
		service: '',
		auth: {
			user: '',
			pass: ''
		}
	}
}

module.exports = config;