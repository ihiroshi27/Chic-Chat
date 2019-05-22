import React from 'react';
import './register.css';

const API_URL = process.env.REACT_APP_API_URL;

class Register extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isSubmitFormComplete: true
		}
	}
	onSubmit = (event) => {
		event.preventDefault();
		let target = event.target;
		this.setState({ isSubmitFormComplete: false });

		let file = target.file.value;
		if (file === "") {
			alert("Please upload an image");
		} else {
			let password = target.password.value;
			let re_password = target.re_password.value;

			if (password !== re_password) {
				alert("Password not match");
			} else {
				let formData = new FormData(target);
				fetch(API_URL + '/user', {
					method: 'POST',
					body: formData
				})
				.then(response => response.json().then(body => ({ status: response.status, body: body })))
				.then(response => {
					if (response.status !== 200) {
						alert(response.body.error);
					} else {
						localStorage.setItem("token", response.body.token);
						window.location.href = '/';
					}
					this.setState({ isSubmitFormComplete: true });
				});
			}
		}
	}
	onProfileChange = (event) => {
		if (event.target.value === "") {
			let icon = document.createElement("i");
			icon.className = "fas fa-user-alt";
			this.profile.innerHTML = "";
			this.profile.append(icon);
		} else {
			let profile = new Image();
			profile.setAttribute("src", URL.createObjectURL(event.target.files[0]));
			this.profile.innerHTML = "";
			this.profile.append(profile);
		}
	}
	render() {
		return (
			<div id="container">
				<div id="register" className="wrapper">
					<div className="section">
						<div className="body">
							<div className="profile">
								<div className="profile-img" ref={ div => { this.profile = div } }>
									<i className="fas fa-user-alt"></i>
								</div>
								<button onClick={ () => this.file.click() } className="button grey-outset">Choose Image</button>
							</div>
							<div className="form">
								<form encType="multipart/form-data" onSubmit={ this.onSubmit }>
									<div className="input-icon">
										<i className="fas fa-user"></i>
										<input name="username" type="text" placeholder="Username" required />
									</div>
									<div className="input-icon">
										<i className="fas fa-key"></i>
										<input name="password" type="password" placeholder="Password" required />
									</div>
									<div className="input-icon">
										<i className="fas fa-key"></i>
										<input name="re_password" type="password" placeholder="Confirm Password" required />
									</div>
									<div className="input-icon">
										<i className="fas fa-user-tag"></i>
										<input name="name" type="text" placeholder="Name" required />
									</div>
									<div className="input-icon">
										<i className="fas fa-envelope"></i>
										<input name="email" type="email" placeholder="Email" required />
									</div>
									<div className="input-icon">
										<i className="fas fa-mobile"></i>
										<input name="mobile" type="text" pattern="[0-9]{10}" placeholder="Mobile" required />
									</div>
									<div className="input-icon">
										<i className="fas fa-id-card"></i>
										<input name="citizen_id" type="text" pattern="[0-9]{13}" placeholder="Citizen ID" required />
									</div>
									<input onChange={ this.onProfileChange } ref={ input => { this.file = input } } name="file" type="file" style={{ display: 'none' }} />
									<button className="button full red" type="submit"><i className="far fa-check-circle"></i> Register</button>
								</form>
							</div>
						</div>
					</div>
				</div>
				<div className="loading-overlay" hidden={ this.state.isSubmitFormComplete }><div className="loading"><div></div><div></div></div></div>
			</div>
		)
	}
}

export default Register;