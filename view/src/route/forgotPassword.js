import React from 'react';
import { Link } from 'react-router-dom';
import './forgotPassword.css';

const API_URL = process.env.REACT_APP_API_URL;

class ResetPassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isSubmitFormComplete: true
		}
	}
	onSubmit = (event) => {
		event.preventDefault();
		let email = event.target.email.value;
		this.setState({ isSubmitFormComplete: false });
		fetch(API_URL + '/reset-password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email: email })
		})
		.then(response => response.json().then(body => ({ status: response.status, body: body })))
		.then(response => {
			if (response.status !== 200) {
				alert(response.body.error);
			} else {
				window.location.href = '/';
			}
			this.setState({ isSubmitFormComplete: true });
		});
	}
	render() {
		return (
			<div id="container">
				<div id="forgot-password" className="wrapper">
					<div className="section">
						<div className="body">
							<div className="title"><Link to="/"><i className="fas fa-angle-left"></i></Link> Forgot your password?</div>
							<div className="subtitle">Please enter your email account that you registered.<br/>We will send a reset password link to your email.</div>
							<form onSubmit={ this.onSubmit }>
								<div className="input-icon">
									<i className="fas fa-envelope"></i>
									<input name="email" type="email" placeholder="Email" required />
								</div>
								<button className="button full red" type="submit"><i className="far fa-check-circle"></i> Confirm</button>
							</form>
						</div>
					</div>
				</div>
				<div className="loading-overlay" hidden={ this.state.isSubmitFormComplete }><div className="loading"><div></div><div></div></div></div>
			</div>
		)
	}
}

export default ResetPassword;