import React from 'react';
import { Link } from 'react-router-dom';

import FriendList from '../component/friendList';

const API_URL = process.env.REACT_APP_API_URL;

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fetched: false,
			users: []
		}
	}
	componentWillMount() {
		this.fetchUser();
	}
	fetchUser = () => {
		fetch(API_URL + "/search?q=" + new URLSearchParams(this.props.location.search).get("q"), {
			method: 'GET',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token")
			}
		})
		.then(response => response.json().then(body => ({ status: response.status, body: body })))
		.then(response => {
			this.setState({ 
				fetched: true,
				users: response.body.users
			});
		});
	}
	render() {
		return (
			<div id="container">
				<div className="wrapper">
					<div className="section">
						<div className="title"><Link to="/"><i className="fas fa-angle-left"></i></Link> Find Friend</div>
						<div className="subtitle"><i className="far fa-user"></i> Discovered { this.state.users.length } friends for { new URLSearchParams(this.props.location.search).get("q") }</div>
						<div className="body">
							<div className="friend-list">
							{
								!this.state.fetched ? null :
									<FriendList users={ this.state.users } refetch={ this.fetchUser } />
							}
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default Search;