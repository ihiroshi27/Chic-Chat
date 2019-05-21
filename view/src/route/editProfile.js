import React from 'react';
import { Link } from 'react-router-dom';
import './editProfile.css';

const API_URL = process.env.REACT_APP_API_URL;

class EditProfile extends React.Component {
	onProfileChange = (event) => {
		if (event.target.value === "") {
			let profile = new Image();
			profile.setAttribute("src", API_URL + '/static/' + this.props.user.profile);
			this.profile.innerHTML = "";
			this.profile.append(profile);
		} else {
			let profile = new Image();
			profile.setAttribute("src", URL.createObjectURL(event.target.files[0]));
			this.profile.innerHTML = "";
			this.profile.append(profile);
		}
	}
	onSubmit = (event) => {
		event.preventDefault();
		let target = event.target;
		let formData = new FormData(target);
		fetch(API_URL + '/user', {
			method: 'PUT',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token")
			},
			body: formData
		})
		.then(response => response.json().then(body => ({ status: response.status, body: body })))
		.then(response => {
			if (response.status !== 200) {
				alert(response.body.error);
			} else {
				alert('Complete');
			}
		});
	}
	render() {
		return (
			<div id="container">
				<div id="edit-profile" className="wrapper">
					<div className="section">
						<div className="title"><Link to="/"><i className="fas fa-angle-left"></i></Link> Edit Profile</div>
						<div className="body">
							<div className="profile">
								<div className="profile-img" ref={ div => { this.profile = div } }>
									<img src={ API_URL + '/static/' + this.props.user.profile } alt="Profile" />
								</div>
								<button onClick={ () => this.file.click() } className="button grey-outset">Choose Image</button>
							</div>
							<div className="form">
								<form encType="multipart/form-data" onSubmit={ this.onSubmit }>
									<div className="input-icon">
										<i className="fas fa-user-tag"></i>
										<input name="name" type="text" placeholder="Name" defaultValue={ this.props.user.name } required />
									</div>
									<div className="input-icon">
										<i className="fas fa-envelope"></i>
										<input name="email" type="email" placeholder="Email" defaultValue={ this.props.user.email } required />
									</div>
									<div className="input-icon">
										<i className="fas fa-mobile"></i>
										<input name="mobile" type="text" pattern="[0-9]{10}" placeholder="Mobile" defaultValue={ this.props.user.mobile } required />
									</div>
									<div className="input-icon">
										<i className="fas fa-id-card"></i>
										<input name="citizen_id" type="text" pattern="[0-9]{13}" placeholder="Citizen ID" defaultValue={ this.props.user.citizen_id } required />
									</div>
									<input onChange={ this.onProfileChange } ref={ input => { this.file = input } } name="file" type="file" style={{ display: 'none' }} />
									<button className="button full red" type="submit"><i className="fas fa-user-edit"></i> Edit Profile</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default EditProfile;