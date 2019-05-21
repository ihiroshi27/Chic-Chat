import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Home from './route/home';
import Login from './route/login';
import Register from './route/register';
import Search from './route/search';
import EditProfile from './route/editProfile';

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
				this.setState({
					user_fetched: true,
					user: response.body.user
				});
			});
		}
	}
	render () {
		if (!localStorage.getItem('token')) {
			return (
				<BrowserRouter>
					<Route exact path="/" component={ Login } />
					<Route exact path="/register" component={ Register } />
				</BrowserRouter>
			)
		} else {
			if (!this.state.user_fetched) {
				return (
					<div class="loading"><div></div><div></div></div>
				)
			} else {
				return (
					<BrowserRouter>
						<Header user={ this.state.user } />
						<Route exact path="/" render={(props) => (<Home {...props} user={ this.state.user } />) } />
						<Route exact path="/search" render={(props) => (<Search {...props} />) } />
						<Route exact path="/edit-profile" render={(props) => (<EditProfile {...props} user={ this.state.user} />) } />
						<Footer />
					</BrowserRouter>
				)
			}
		}
	}
}

export default App;