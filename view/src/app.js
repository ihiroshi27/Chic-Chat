import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Home from './route/home';
import Login from './route/login';
import Register from './route/register';
import Search from './route/search';
import EditProfile from './route/editProfile';
import ForgotPassword from './route/forgotPassword';
import ResetPassword from './route/resetPassword';
import LoginHistory from './route/loginHistory';
import Blocking from './route/blocking';

import Header from './component/header';
import Footer from './component/footer';

import './app.css';
import './loading.css';
import './input.css';
import './button.css';
import './section.css';

const API_URL = process.env.REACT_APP_API_URL;

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user_fetched: false,
			user: {}
		}
		this.refetchFriend = function() { };
	}
	componentWillMount() {
		this.fetchUser();
	}
	fetchUser() {
		if (localStorage.getItem("token")) {
			fetch(API_URL + '/user', {
				method: 'GET',
				headers: {
					'Authorization': "Bearer " + localStorage.getItem("token")
				}
			})
			.then(response => response.json().then(body => ({ status: response.status, body: body })))
			.then(response => {
				if (response.status !== 200) {
					alert(response.body.error);
					localStorage.removeItem("token");
					window.location.href = '/';
				} else {
					this.setState({
						user_fetched: true,
						user: response.body.user
					});
				}
			});
		}
	}
	render () {
		if (!localStorage.getItem('token')) {
			return (
				<BrowserRouter>
					<Route exact path="/" component={ Login } />
					<Route exact path="/forgot-password" component={ ForgotPassword } />
					<Route exact path="/reset-password" component={ ResetPassword } />
					<Route exact path="/register" component={ Register } />
				</BrowserRouter>
			)
		} else {
			if (!this.state.user_fetched) {
				return (
					<div className="loading"><div></div><div></div></div>
				)
			} else {
				return (
					<BrowserRouter>
						<Header user={ this.state.user } refetchFriend={() => this.refetchFriend() } />
						<Route exact path="/" render={ (props) => (<Home {...props} user={ this.state.user } refetchFriend={ refetch => this.refetchFriend = refetch } />) } />
						<Route exact path="/search" render={ (props) => (<Search {...props} />) } />
						<Route exact path="/blocking" render={ (props) => (<Blocking {...props} user={ this.state.user } />) } />
						<Route exact path="/edit-profile" render={ (props) => (<EditProfile {...props} user={ this.state.user } />) } />
						<Route exact path="/login-history" render={ (props) => (<LoginHistory {...props} user={ this.state.user } />)} />
						<Route exact path="/reset-password" component={ ResetPassword } />
						<Footer />
					</BrowserRouter>
				)
			}
		}
	}
}

export default App;