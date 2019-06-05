let config = {};

config.app = {};
config.security = {};
config.recaptcha = {};
config.db = {};
config.mail = {};

config.app.hostname = "0.0.0.0";
config.app.port = 8082;

config.security.expiredDate = 30;
config.security.secret = "secretkey";
config.security.saltRounds = 10;

config.recaptcha.secret = "";

config.db.host = "localhost";
config.db.user = "root";
config.db.password = "";
config.db.database = "chic_chat";

config.mail.service = "";
config.mail.auth = {};
config.mail.auth.user = "";
config.mail.auth.pass = "";

module.exports = config;