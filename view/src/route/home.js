import React from 'react';
import io from 'socket.io-client';

import FriendSelector from '../component/friendSelector';
import ChatList from '../component/chatList';
import './home.css';

const API_URL = process.env.REACT_APP_API_URL;

let chatIO;
let timeout;

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isMobile: false,
			isChatWrapperHidden: false,
			friends_fetched: false,
			friends: [],
			friend: {},
			chat_fetched: false,
			chat: [],
			typing: false
		}
	}
	componentWillMount() {
		this.fetchFriend();
		this.props.refetchFriend(this.fetchFriend);
	}
	componentDidMount() {
		window.addEventListener("resize", () => {
			if (window.innerWidth < 970) {
				this.setState({
					isMobile: true,
					isChatWrapperHidden: true,
					friend: {}
				});
			} else if (this.state.isChatWrapperHidden === true) {
				this.setState({
					isMobile: false,
					isChatWrapperHidden: false 
				});
			}
		});
		window.dispatchEvent(new Event('resize'));
	}
	fetchFriend = () => {
		fetch(API_URL + "/friend", {
			method: 'GET',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token")
			}
		})
		.then((response) => response.json().then(body => ({ status: response.status, body: body })))
		.then((response) => {
			if (response.body.friends.length === 0) {
				this.setState({
					friends_fetched: true,
					friends: [],
					friend: {},
					chat_fetched: true,
					chat: []
				});
			} else {
				this.setState({ 
					friends_fetched: true,
					friends: response.body.friends,
					friend: {}
				}, () => {
					this.fetchChat(this.state.friend.id);
					this.setListener(this.state.friend.id);
				});
			}
		});
	}
	fetchChat = (friendID) => {
		fetch(API_URL + "/chat/" + friendID, {
			method: 'GET',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token")
			}
		})
		.then((response) => response.json().then(body => ({ status: response.status, body: body })))
		.then((response) => {
			this.setState({
				chat_fetched: true,
				chat: response.body.chat
			}, () => {
				let chatList = document.getElementById('chat-list');
				chatList.scrollTop = chatList.scrollHeight;
			});
		});
	}
	setListener = (friendID) => {
		chatIO = io(API_URL, { path: '/io/chat' });
		chatIO.emit('info', {
			userID: this.props.user.id,
			friendID: friendID
		});
		chatIO.on('update', () => { this.fetchChat(friendID); });
		chatIO.on('typing', (typing) => { this.setState({ typing: typing }); });
	}
	onFriendChange = (friend) => {
		this.setState({ 
			friend: friend,
			chat_fetched: false,
			chat: []
		}, () => {
			this.fetchChat(this.state.friend.id);
			this.setListener(this.state.friend.id);
		});
		if (this.state.isMobile) {
			this.setState({
				isChatWrapperHidden: false
			});
		}
	}
	onMessageKeyUp = (event) => {
		chatIO.emit('typing', { 
			typing: true, 
			userID: this.props.user.id,
			friendID: this.state.friend.id 
		});
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			chatIO.emit('typing', {
				typing: false,
				userID: this.props.user.id,
				friendID: this.state.friend.id
			});
		}, 2000);
	}
	onSendMessage = (event) => {
		event.preventDefault();
		let friendID = this.state.friend.id;
		let message = event.target.message.value;
		event.target.message.value = "";

		fetch(API_URL + '/chat', {
			method: 'POST',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token"),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				friendID: friendID,
				message: message
			})
		})
		.then((response) => response.json().then(body => ({ status: response.status, body: body })))
		.then((response) => {
			this.fetchChat(friendID);
		});
	}
	render () {
		if (!this.state.friends_fetched) {
			return (
				<div id="container">
					<div id="home" className="wrapper">
						<div className="loading"><div></div><div></div></div>
					</div>
				</div>
			)
		} else {
			return (
				<div id="container">
					<div id="home" className="wrapper">
						<div className="friend-wrapper" hidden={ this.state.isMobile && !this.state.isChatWrapperHidden }>
							<FriendSelector 
								friends={ this.state.friends }
								friend={ this.state.friend }
								onChange={ this.onFriendChange }
								refetch={ this.fetchFriend }
							/>
						</div>
						<div className="chat-wrapper" hidden={ this.state.isChatWrapperHidden }>
							<div className="header"><button hidden={ !this.state.isMobile } onClick={ () => { this.setState({ isChatWrapperHidden: true, friend: {} }) } } ><i className="fas fa-angle-left"></i></button> { this.state.friend.name }<span className="typing" hidden={ !this.state.typing }> is typing...</span></div>
							<ChatList user={ this.props.user } friend={ this.state.friend } chat_fetched={ this.state.chat_fetched } chat={ this.state.chat } />
							<div className="send-box">
								<form onSubmit={ this.onSendMessage }>
									<input 
										name="message"
										type="text"
										placeholder={ this.state.friend.being_blocked ? "You have been blocked" : "Type a message" }
										autoComplete="off"
										onKeyUp={ this.onMessageKeyUp }
										disabled={ 
											!this.state.chat_fetched || 
											(this.state.friends.length === 0) || 
											this.state.friend.name === undefined ||
											this.state.friend.being_blocked }
										required
									/>
									<button type="submit" title="Send"><i className="fas fa-paper-plane"></i></button>
								</form>
							</div>
						</div>
					</div>
				</div>
			)
		}
	}
}

export default Home;