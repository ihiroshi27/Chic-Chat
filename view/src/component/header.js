import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

const API_URL = process.env.REACT_APP_API_URL;

var typingTimer;
const doneTypingInterval = 1000;

class Header extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showProfileOption: false,
			isSearchListHidden: true,
			friends_fetched: true,
			friends: []
		}
	}
	componentDidMount() {
		window.addEventListener('click', (e) => {
			if (
				!document.getElementById('profile').contains(e.target) &&
				!document.getElementById('profile-option').contains(e.target) && 
				!document.getElementById('search_list').contains(e.target)
			){
				this.setState({
					showProfileOption: false,
					isSearchListHidden: true
				});
			}
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
		fetch(API_URL + "/search?q=" + query, {
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
	}
	onAddFriend(friendID) {
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
	onUnfriend(friendID) {
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
						<div id="search_list" className="search_list" hidden={ this.state.isSearchListHidden }>
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
															<button onClick={ () => this.onUnfriend(friend.id) }><i className="fas fa-user-times"></i> Unfriend</button>
														}
													</div>
												</div>
											)
										})
							}
						</div>
					</div>
					<div id="profile" className="profile">
						<div className="profile-name">{ user.name }</div>
						<div className="profile-img-wrapper">
							<img className="profile-img" src={ API_URL + "/static/" + user.profile } alt="Profile" />
						</div>
						<button onClick={ () => { this.setState({ showProfileOption: !this.state.showProfileOption }) } } className="profile-button"><i className="fas fa-angle-down"></i></button>
					</div>
					<div id="profile-option" className="profile-option" hidden={ !this.state.showProfileOption }>
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