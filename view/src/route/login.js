import React from 'react';
import { Link } from 'react-router-dom';
import './login.css';

const API_URL = process.env.REACT_APP_API_URL;
const RECAPTCHA_KEY = process.env.REACT_APP_RECAPTCHA_KEY;

class Login extends React.Component {
	constructor(props) {
		super(props);
		const attempt = localStorage.getItem("attempt") || 0;
		this.state = {
			isSubmitFormComplete: true,
			isRecaptchaHidden: attempt < 3
		}
	}
	onSubmit = (event) => {
		event.preventDefault();
		let username = event.target.username.value;
		let password = event.target.password.value;
		let recaptcha = event.target["g-recaptcha-response"].value;

		if (!this.state.isRecaptchaHidden && !recaptcha) {
			alert('reCAPTCHA is required');
		} else {
			this.setState({ isSubmitFormComplete: false });
			fetch(API_URL + '/authentication', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: username,
					password: password,
					recaptcha: recaptcha
				})
			})
			.then(response => response.json().then(body => ({ status: response.status, body: body })))
			.then(response => {
				if (response.status !== 200) {
					let attempt = parseInt(localStorage.getItem("attempt") ? localStorage.getItem("attempt") : 0) + 1;
					localStorage.setItem("attempt", attempt);
					if (attempt > 2) {
						this.setState({ isRecaptchaHidden: false });
					}
					alert(response.body.error);
				} else {
					localStorage.setItem("token", response.body.token);
					localStorage.removeItem("attempt")
					window.location.reload();
				}
				this.setState({ isSubmitFormComplete: true });
			});
		}
	}
	componentDidMount() {
		const script = document.createElement('script')
		script.src = 'https://www.google.com/recaptcha/api.js';
		document.body.appendChild(script);
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
								<div className="g-recaptcha" data-sitekey={ RECAPTCHA_KEY } hidden={ this.state.isRecaptchaHidden }></div>
								<button className="button full red" type="submit"><i className="fas fa-sign-in-alt"></i> Sign In</button>
							</form>
							<Link className="forgot-password" to="/forgot-password">Forgot your password?</Link>
							<Link className="register" to="/register">Create an account <i className="fas fa-angle-right"></i></Link>
						</div>
					</div>
				</div>
				<div className="loading-overlay" hidden={ this.state.isSubmitFormComplete }><div className="loading"><div></div><div></div></div></div>
			</div>
		)
	}
}

export default Login;