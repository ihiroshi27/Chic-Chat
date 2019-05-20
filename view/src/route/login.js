import React from 'react';
import { Link } from 'react-router-dom';
import './login.css';

const API_URL = process.env.REACT_APP_API_URL;

class Login extends React.Component {
	onSubmit(event) {
		event.preventDefault();

		let username = event.target.username.value;
		let password = event.target.password.value;

		fetch(API_URL + '/authentication', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: username,
				password: password
			})
		})
		.then(response => response.json().then(body => ({ status: response.status, body: body })))
		.then(response => {
			if (response.status !== 200) {
				alert(response.body.error);
			} else {
				localStorage.setItem("token", response.body.token);
				window.location.reload();
			}
		});
	}
	render() {
		return (
			<div id="container">
				<div id="login" className="wrapper">
					<div className="section">
						<div className="body">
							<div className="profile">
								<i className="fas fa-user-alt"></i>
							</div>
							<form onSubmit={ this.onSubmit }>
								<div className="input-icon">
									<i className="fas fa-user"></i>
									<input name="username" type="text" placeholder="Username" required />
								</div>
								<div className="input-icon">
									<i className="fas fa-key"></i>
									<input name="password" type="password" placeholder="Password" required />
								</div>
								<button className="button full red" type="submit"><i className="fas fa-sign-in-alt"></i> Sign In</button>
							</form>
							<Link className="register" to="/register">Create an account <i className="fas fa-angle-right"></i></Link>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default Login;