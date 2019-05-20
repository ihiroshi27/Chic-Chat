import React from 'react';
import './friendSelector.css';

const API_URL = process.env.REACT_APP_API_URL;

class FriendSelector extends React.Component {
	onUnfriend(event, friendID) {
		event.stopPropagation();
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
			<div id="friend-selector">
				<div className="title">Friends</div>
				<div className="message" hidden={ this.props.friends.length !== 0 }><i className="fas fa-info-circle"></i> No Friends</div>
				{
					this.props.friends.map((friend, index) => {
						return (
							<div 
								className={ "friend " + (this.props.friend.id !== friend.id ? "" : "focus") }
								onClick={ () => { this.props.onChange(friend) } }
								key={ index } 
							>
								<div className="friend-img-wrapper">
									<img src={ API_URL + "/static/" + friend.profile } alt={ friend.name } />
								</div>
								<div className="friend-name">{ friend.name }</div>
								<div className="friend-option">
									<button title="Unfriend" onClick={ (event) => { this.onUnfriend(event, friend.id) } }><i className="fas fa-user-times"></i></button>
								</div>
							</div>
						)
					})
				}
			</div>
		)
	}
}

export default FriendSelector;