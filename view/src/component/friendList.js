import React from 'react';
import './friendList.css';

const API_URL = process.env.REACT_APP_API_URL;

class FriendList extends React.Component {
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
				this.props.refetch();
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
				this.props.refetch();
			}
		});
	}
	render() {
		return (
			<div id="friend-list">
				<div className="message" hidden={ this.props.users.length > 0 }><i className="fas fa-info-circle"></i> Not Found</div>
				{
					this.props.users.map((user, index) => {
						return (
							<div className="friend" key={ index }>
								<div className="friend-img-wrapper">
									<img className="friend-img" src={ API_URL + "/static/" + user.profile } alt={ user.name } />
								</div>
								<div className="friend-profile">
									<div className="friend-profile-name">{ user.name }</div>
									<div className="friend-profile-username"><i className="fas fa-user-tag"></i> { user.username }</div>
								</div>
								<div className="friend-option">
									{ 
										user.friended === "NO" ?
											<button onClick={ () => this.onAddFriend(user.id) }><i className="fas fa-user-plus"></i> Add Friend</button>
										:
										<button onClick={ () => this.onUnfriend(user.id) }><i className="fas fa-user-times"></i> Unfriend</button>
									}
								</div>
							</div>
						)
					})
				}
			</div>
		)
	}
}

export default FriendList;