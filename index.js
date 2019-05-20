const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const config = require('./config');
const authentication = require('./controller/authentication');
const user = require('./controller/user');
const search = require('./controller/search');
const friend = require('./controller/friend');
const chat = require('./controller/chat');

const app = express();

const server = http.createServer(app);
const io = require('socket.io')(server);
let listener = [];
io.on('connection', (client) => {
	client.on('info', function(data) {
		listener.push({
			clientID: client.id,
			userID: data.userID,
			friendID: data.friendID
		});
	});
	client.on('typing', function(data) {
		listener.forEach((listen) => {
			if (listen.userID === data.friendID && listen.friendID === data.userID) {
				io.to(listen.clientID).emit('typing', data.typing);
			}
		})
	});
	client.on('disconnect', function(data) {
		listener.filter((listen) => {
			return listen.userID === client.id
		});
	});
});
app.use(function(req, res, next) {
	req.io = io;
	req.listener = listener;
	next();
});

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
	next();
});
app.use(bodyParser.json());
app.use('/static', express.static('uploads'));
app.use('/authentication', authentication);
app.use('/user', user);
app.use('/search', search);
app.use('/friend', friend);
app.use('/chat', chat);
app.use(function(err, req, res, next) {
	console.log(err.stack);
	res.status(500).json({ error: err.message });
});

server.listen(config.app.port);