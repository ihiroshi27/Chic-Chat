import React from 'react';
import { Link } from 'react-router-dom';

import FriendList from '../component/friendList';

import './search.css';

const API_URL = process.env.REACT_APP_API_URL;

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			friends_fetched: false,
			friends: []
		}
	}
	componentWillMount() {
		this.fetchFriend();
	}
	fetchFriend = () => {
		fetch(API_URL + "/search?q=" + new URLSearchParams(this.props.location.search).get("q"), {
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
	render() {
		if (!this.state.friends_fetched) {
			return (
				<div id="container">
					<div id="search" className="wrapper">
						<div className="loading"><div></div><div></div></div>
					</div>
				</div>
			)
		} else {
			return (
				<div id="container">
					<div id="search" className="wrapper">
						<div className="section">
							<div className="title"><Link to="/"><i className="fas fa-angle-left"></i></Link> Find Friend</div>
							<div className="subtitle"><i className="far fa-user"></i> Discovered { this.state.friends.length } friends for { new URLSearchParams(this.props.location.search).get("q") }</div>
							<div className="body">
								<div className="friend-list">
								{
									!this.state.friends_fetched ? null :
										<FriendList friends={ this.state.friends } refetch={ this.fetchFriend } />
								}
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
	}
}

export default Search;