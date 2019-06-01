import React from 'react';
import moment from 'moment';

import './chatList.css';

const API_URL = process.env.REACT_APP_API_URL;

class ChatList extends React.Component {
	render() {
		if (!this.props.chat_fetched) {
			return (
				<div id="chat-list">
					<div className="loading"><div></div><div></div></div>
				</div>
			)
		} else {
			return (
				<div id="chat-list">
				{
					this.props.chat.map((chat, index) => {
						if (chat.user_id1 !== this.props.user.id) {
							return (
								<div className="chat friend" key={ index }>
									<div className="profile">
										<div className="profile-img-wrapper">
											<img src={ API_URL + "/static/" + this.props.friend.profile } alt={ this.props.friend.name } />
										</div>
										<div className="timestamp">{ moment(chat.createdAt).fromNow() }</div>
									</div>
									<div className="message"><i className="fas fa-caret-left"></i>{ chat.message }</div>
								</div>
							)
						} else {
							return (
								<div className="chat" key={ index }>
									<div className="message"><i className="fas fa-caret-right"></i>{ chat.message }</div>
									<div className="profile">
										<div className="profile-img-wrapper">
											<img src={ API_URL + "/static/" + this.props.user.profile } alt={ this.props.user.name } />
										</div>
										<div className="timestamp">{ moment(chat.createdAt).fromNow() }</div>
									</div>
								</div>
							)
						}
					})
				}
				</div>
			)
		}
	}
}

export default ChatList;