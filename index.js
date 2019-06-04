const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const config = require('./config');
const authentication = require('./controller/authentication');
const user = require('./controller/user');
const search = require('./controller/search');
const friend = require('./controller/friend');
const chat = require('./controller/chat');
const resetPassword = require('./controller/reset');
const notification = require('./controller/notification');

const app = express();
app.enable('trust proxy');

const server = http.createServer(app);
const notificationIO = require('socket.io')(server, { path: '/io/notification' });
let notificationListener = [];
notificationIO.on('connection', (client) => {
	client.on('info', function(data) {
		notificationListener.push({
			clientID: client.id,
			listenerID: data.userID
		});
	});
	client.on('disconnect', function(data) {
		notificationListener.filter((listener) => {
			return listener.clientID === client.id;
		});
	});
});
const chatIO = require('socket.io')(server, { path: '/io/chat' });
let chatListener = [];
chatIO.on('connection', (client) => {
	client.on('info', function(data) {
		chatListener.push({
			clientID: client.id,
			listenerID: data.userID,
			friendID: data.friendID
		});
	});
	client.on('typing', function(data) {
		chatListener.forEach((listen) => {
			if (listen.listenerID === data.friendID && listen.friendID === data.userID) {
				chatIO.to(listen.clientID).emit('typing', data.typing);
			}
		});
	});
	client.on('disconnect', function(data) {
		chatListener.filter((listen) => {
			return listen.clientID === client.id
		});
	});
});
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
	next();
});
app.use(bodyParser.json());
app.use(function(req, res, next) {
	req.socketIO = {
		notification: {
			io: notificationIO,
			listener: notificationListener
		},
		chat: {
			io: chatIO,
			listener: chatListener
		}
	}
	next();
});
app.use('/static', express.static('uploads'));
app.use('/authentication', authentication);
app.use('/user', user);
app.use('/search', search);
app.use('/friend', friend);
app.use('/chat', chat);
app.use('/reset', resetPassword);
app.use('/notification', notification);
app.use(function(err, req, res, next) {
	console.log(err.stack);
	res.status(500).json({ error: err.message });
});

server.listen(config.app.port, config.app.hostname);