const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');

const config = require('./config');
const authentication = require('./controller/authentication');
const user = require('./controller/user');
const friend = require('./controller/friend');
const chat = require('./controller/chat');
const resetPassword = require('./controller/reset');
const notification = require('./controller/notification');

const app = express();
app.enable('trust proxy');

const server = http.createServer(app);
const PORT = process.env.PORT || config.app.port;

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
app.use('/api/static', express.static('uploads'));
app.use('/api/authentication', authentication);
app.use('/api/user', user);
app.use('/api/friend', friend);
app.use('/api/chat', chat);
app.use('/api/reset-password', resetPassword);
app.use('/api/notification', notification);
app.use(express.static(path.join(__dirname, 'view', 'build')));
app.use(function(req, res, next) {
	res.sendFile(path.join(__dirname, 'view', 'build', 'index.html'));
});
app.use(function(err, req, res, next) {
	console.log(err.stack);
	if (err.parent) console.log(err.parent);
	res.status(500).json({ error: err.parent ? err.parent.message : err.message });
});

server.listen(PORT, config.app.hostname);