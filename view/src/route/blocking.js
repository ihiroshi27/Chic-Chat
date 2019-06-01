import React from 'react';
import { Link } from 'react-router-dom';

import FriendList from '../component/friendList';

import './blocking.css';

const API_URL = process.env.REACT_APP_API_URL;

class Blocking extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			blocking_fetched: false,
			blocking: []
		}
	}
	componentWillMount() {
		this.fetchBlocking();
	}
	fetchBlocking = () => {
		fetch(API_URL + "/friend/blocking", {
			method: 'GET',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token")
			}
		})
		.then(response => response.json().then(body => ({ status: response.status, body: body })))
		.then(response => {
			this.setState({ 
				blocking_fetched: true,
				blocking: response.body.blocking
			});
		});
	}
	render() {
		if (!this.state.blocking_fetched) {
			return (
				<div id="container">
					<div id="blocking" className="wrapper">
						<div className="loading"><div></div><div></div></div>
					</div>
				</div>
			)
		} else {
			return (
				<div id="container">
					<div id="blocking" className="wrapper">
						<div className="section">
							<div className="title"><Link to="/"><i className="fas fa-angle-left"></i></Link> Blocking</div>
							<div className="body">
								<FriendList friends={ this.state.blocking } refetch={ this.fetchBlocking } />
							</div>
						</div>
					</div>
				</div>
			)
		}
	}
}

export default Blocking;