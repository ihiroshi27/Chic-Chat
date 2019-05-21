import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

const API_URL = process.env.REACT_APP_API_URL;

class Header extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showProfileOption: false
		}
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
								<input name="q" type="search" placeholder="Find Friend by Name, Username, Email or Mobile" />
								<button><i className="fas fa-search"></i></button>
							</div>
						</form>
					</div>
					<div className="profile">
						<div className="profile-name">{ user.name }</div>
						<div className="profile-img-wrapper">
							<img className="profile-img" src={ API_URL + "/static/" + user.profile } alt="Profile" />
						</div>
						<button onClick={ () => { this.setState({ showProfileOption: !this.state.showProfileOption }) } } className="profile-button"><i className="fas fa-angle-down"></i></button>
					</div>
					<div className="profile-option" hidden={ !this.state.showProfileOption }>
						<Link to="/edit-profile" onClick={ () => this.setState({ showProfileOption: false }) }><i className="fas fa-user-edit"></i> Edit Profile</Link>
						<button onClick={ this.signOut }><i className="fas fa-sign-out-alt"></i> Sign Out</button>
					</div>
				</div>
			</div>
		)
	}
}

export default Header;