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
import './input.css';
import './button.css';
import './section.css';

class App extends React.Component {
	render () {
		if (typeof(localStorage.token) === 'undefined') {
			return (
				<BrowserRouter>
					<Route exact path="/" component={ Login } />
					<Route exact path="/register" component={ Register } />
				</BrowserRouter>
			)
		} else {
			return (
				<BrowserRouter>
					<Header />
					<Route exact path="/" component={ Home } />
					<Route exact path="/search" component={ Search } />
					<Route exact path="/edit-profile" component={ EditProfile } />
					<Footer />
				</BrowserRouter>
			)
		}
	}
}

export default App;