import React from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import './header.css';

let notificationIO;
let typingTimer;

const IO_URL = process.env.REACT_APP_IO_URL;
const API_URL = process.env.REACT_APP_API_URL;
const doneTypingInterval = 1000;

class Header extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showProfileOption: false,
			isSearchListHidden: true,
			isNotificationListHidden: true,
			friends_fetched: true,
			friends: [],
			notification_fetched: false,
			notification_unread: 0,
			notification: []
		}
	}
	componentDidMount() {
		window.addEventListener('click', (e) => {
			if (
				!document.getElementById('profile').contains(e.target) &&
				!document.getElementById('profile-option').contains(e.target) && 
				!document.getElementById('search-list').contains(e.target) &&
				!document.getElementById('notification').contains(e.target) &&
				!document.getElementById('notification-list').contains(e.target)
			){
				this.setState({
					showProfileOption: false,
					isSearchListHidden: true,
					isNotificationListHidden: true
				});
			}
		});
		this.setListener();
		this.fetchNotification();
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevState.isNotificationListHidden !== this.state.isNotificationListHidden) {
			if (this.state.isNotificationListHidden) {
				this.fetchNotification();
			} else {
				if (this.state.notification_unread !== 0) {
					fetch(API_URL + '/notification/allread', {
						method: 'PUT',
						headers: {
							'Authorization': "Bearer " + localStorage.getItem("token")
						}
					})
					.then((response) => response.json().then((body) => ({ status: response.status, body: body })))
					.then((response) => {
						
					});
				}
			}
		}
	}
	setListener = () => {
		notificationIO = io(IO_URL, { path: '/io/notification' });
		notificationIO.emit('info', {
			userID: this.props.user.id
		});
		notificationIO.on('update', () => { 
			this.fetchNotification();
		});
	}
	fetchNotification = () => {
		fetch(API_URL + '/notification', {
			method: 'GET',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token")
			}
		})
		.then((response) => response.json().then((body) => ({ status: response.status, body: body })))
		.then((response) => {
			this.setState({
				notification_fetched: true,
				notification_unread: response.body.notification.filter((notification) => !notification.readed).length,
				notification: response.body.notification
			});
		});
	}
	onSearch = (event) => {
		clearTimeout(typingTimer);
		let query = event.target.value;
		if (query) {
			this.setState({ friends_fetched: false });
			typingTimer = setTimeout(() => {
				this.fetchSearch(query);
			}, doneTypingInterval);
		} else {
			this.setState({
				isSearchListHidden: true,
				friends_fetched: true,
				friends: []
			});
		}
	}
	fetchSearch = (query) => {
		fetch(API_URL + "/user/search?q=" + query, {
			method: 'GET',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token")
			}
		})
		.then(response => response.json().then(body => ({ status: response.status, body: body })))
		.then(response => {
			this.setState({
				friends_fetched: true,
				friends: response.body.friends
			});
		});
	}
	refetch = () => {
		let query = this.query.value;
		this.fetchSearch(query);
		this.props.refetchFriend();
	}
	onAddFriend = (friendID) => {
		fetch(API_URL + '/friend', {
			method: 'POST',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token"),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				friendID: friendID
			})
		})
		.then((response) => response.json().then((body) => ({ status: response.status, body: body })))
		.then((response) => {
			if (response.status !== 200) {
				alert(response.body.error);
			} else {
				this.refetch();
			}
		});
	}
	onCancelFriend = (friendID) => {
		fetch(API_URL + '/friend', {
			method: 'DELETE',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token"),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				friendID: friendID
			})
		})
		.then((response) => response.json().then((body) => ({ status: response.status, body: body })))
		.then((response) => {
			if (response.status !== 200) {
				alert(response.body.error);
			} else {
				this.refetch();
			}
		});
	}
	onUnfriend = (friendID) => {
		if (window.confirm("Are you sure you want to remove this person as your friend?")) {
			this.onCancelFriend(friendID);
		}
	}
	onAccept = (friendID) => {
		fetch(API_URL + '/friend', {
			method: 'POST',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token"),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				friendID: friendID
			})
		})
		.then((response) => response.json().then((body) => ({ status: response.status, body: body })))
		.then((response) => {
			if (response.status !== 200) {
				alert(response.body.error);
			} else {
				this.props.refetchFriend();
				this.fetchNotification();
			}
		});
	}
	onDecline = (friendID) => {
		fetch(API_URL + '/friend', {
			method: 'DELETE',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token"),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				friendID: friendID
			})
		})
		.then((response) => response.json().then((body) => ({ status: response.status, body: body })))
		.then((response) => {
			if (response.status !== 200) {
				alert(response.body.error);
			} else {
				this.fetchNotification();
			}
		});
	}
	signOut() {
		localStorage.removeItem("token");
		window.location.href = '/';
	}
	render() {
		const user = this.props.user;
		return (
			<div id="header">
				<div className="wrapper">
					<div className="search">
						<form action="/search">
							<div className="input-button">
								<input 
									name="q" 
									type="search" 
									placeholder="Find Friend by Name, Username, Email or Mobile" 
									autoComplete="off" 
									onKeyPress={ () => { this.setState({ isSearchListHidden: false }) } }
									onKeyUp={ this.onSearch }
									ref={ input => { this.query = input } }
								/>
								<button><i className="fas fa-search"></i></button>
							</div>
						</form>
					</div>
					<div id="search-list" className="search-list" hidden={ this.state.isSearchListHidden }>
						{
							!this.state.friends_fetched ?
								<div className="loading"><div></div><div></div></div>
							:
								this.state.friends.length === 0 ?
									<div className="message"><i className="fas fa-info-circle"></i> Not Found</div>
								:
									this.state.friends.map((friend, index) => {
										return (
											<div className="friend" key={ index }>
												<div className="friend-img-wrapper">
													<img className="friend-img" src={ API_URL + '/static/' + friend.profile } alt={ friend.name } />
												</div>
												<div className="friend-profile">
													<div className="friend-profile-name">{ friend.name }</div>
													<div className="friend-profile-username"><i className="fas fa-user-tag"></i> { friend.username }</div>
												</div>
												<div className="friend-option">
													{ 
														friend.friended === "NO" ?
															<button onClick={ () => this.onAddFriend(friend.id) }><i className="fas fa-user-plus"></i> Add Friend</button>
														:
														friend.friended === "PENDING" ?
															<button onClick={ () => this.onCancelFriend(friend.id) }><i className="fas fa-user-times"></i> Cancel Request</button>
														:
															<button onClick={ () => this.onUnfriend(friend.id) }><i className="fas fa-user-times"></i> Unfriend</button>
													}
												</div>
											</div>
										)
									})
						}
					</div>
					<div id="notification" className="notification">
						<button onClick={ () => { this.setState({ isNotificationListHidden: !this.state.isNotificationListHidden, showProfileOption: false }); } }><i className="fas fa-bell"></i></button>
						<span hidden={ this.state.notification_unread === 0 }>{ this.state.notification_unread }</span>
					</div>
					<div id="notification-list" className="notification-list" hidden={ this.state.isNotificationListHidden }>
						{
							!this.state.notification_fetched ?
								<div className="loading"><div></div><div></div></div>
							:
								this.state.notification.length === 0 ?
									<div className="message"><i className="fas fa-info-circle"></i> No Notification</div>
								:
									this.state.notification.map((notification, index) => {
										return (
											notification.type === "Request" ?
													<div className={ "notification" + (notification.readed ? " readed": "") } key={ index }>
														<div className="profile-img-wrapper">
															<img src={ API_URL + '/static/' + notification.friend_profile } alt={ notification.friend_name } />
														</div>
														<div className="title">{ notification.friend_name } <span>has sent you a friend request</span></div>
														<div className="option">
															<button onClick={ () => this.onAccept(notification.friend_id) } className="button grey-outset"><i className="far fa-check-circle"></i> Accept</button>
															<button onClick={ () => this.onDecline(notification.friend_id) } className="button grey-outset"><i className="far fa-times-circle"></i> Decline</button>
														</div>
													</div>
												:
													<Link to={{ pathname: '/', state: { friendID: notification.friend_id } }} onClick={ () => { this.setState({ isNotificationListHidden: true }) } } className={ "notification" + (notification.readed ? " readed": "") } key={ index }>
														<div className="profile-img-wrapper">
															<img src={ API_URL + '/static/' + notification.friend_profile } alt={ notification.friend_name } />
														</div>
														<div className="title">{ notification.friend_name } <span>has sent you a message</span></div>
														<div className="message"><i className="fas fa-comment"></i> { notification.message }</div>
													</Link>
										)
									})
						}
					</div>
					<div id="profile" className="profile">
						<div className="profile-img-wrapper">
							<img className="profile-img" src={ API_URL + "/static/" + user.profile } alt="Profile" />
						</div>
						<div className="profile-name">{ user.name.split(" ")[0] }</div>
						<button onClick={ () => { this.setState({ showProfileOption: !this.state.showProfileOption, isNotificationListHidden: true }) } } className="profile-button"><i className="fas fa-angle-down"></i></button>
					</div>
					<div id="profile-option" className="profile-option" hidden={ !this.state.showProfileOption }>
						<Link to="/blocking" onClick={ () => this.setState({ showProfileOption: false }) }><i className="fas fa-user-slash"></i> Blocking</Link>
						<Link to="/edit-profile" onClick={ () => this.setState({ showProfileOption: false }) }><i className="fas fa-user-edit"></i> Edit Profile</Link>
						<Link to="/login-history" onClick={ () => this.setState({ showProfileOption: false }) }><i className="fas fa-history"></i> Login History</Link>
						<button onClick={ this.signOut }><i className="fas fa-sign-out-alt"></i> Sign Out</button>
					</div>
				</div>
			</div>
		)
	}
}

export default Header;