import React from 'react';
import { Link } from 'react-router-dom';
import Moment from 'moment';
import './loginHistory.css';

const API_URL = process.env.REACT_APP_API_URL;

class LoginHistory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history_fetched: false,
			history: [],
			rows_per_page: 10,
			number_of_page: 1,
			current_page: 1,
			isMapHidden: true
		}
	}
	componentWillMount() {
		fetch(API_URL + '/user/login-history', {
			method: 'GET',
			headers: {
				'Authorization': "Bearer " + localStorage.getItem("token")
			}
		})
		.then(response => response.json().then(body => ({ status: response.status, body: body })))
		.then(response => {
			this.setState({ 
				history_fetched: true,
				history: response.body.results,
				number_of_page: Math.ceil(response.body.results.length / this.state.rows_per_page)
			});
		});
	}
	onShowMap = (lat, lng) => {
		this.map.src = `http://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
		this.setState({ isMapHidden: false });
	}
	onRowsPerPageChange = (event) => {
		this.setState({ 
			rows_per_page: event.target.value,
			number_of_page: Math.ceil(this.state.history.length / event.target.value),
			current_page: 1
		});
	}
	onPreviousPage = () => {
		this.setState({ current_page: this.state.current_page - 1 });
	}
	onNextPage = () => {
		this.setState({ current_page: this.state.current_page + 1 });
	}
	onDownload = (type) => {
		window.location.href = API_URL + '/user/login-history/' + type + '?token=' + localStorage.getItem("token");
	}
	render() {
		if (!this.state.history_fetched) {
			return (
				<div id="container">
					<div id="login-history" className="wrapper">
						<div className="loading"><div></div><div></div></div>
					</div>
				</div>
			)
		} else {
			return (
				<div id="container">
					<div id="login-history" className="wrapper">
						<div className="section">
							<div className="title"><Link to="/"><i className="fas fa-angle-left"></i></Link> Login History</div>
							<div className="body">
								<div className="history">
									<table>
										<tbody>
											<tr>
												<th>Datetime</th>
												<th>Success/Failed</th>
												<th>Latitude</th>
												<th>Longtitude</th>
												<th>Map</th>
											</tr>
											{
												this.state.history.map((history, index) => {
													let start = this.state.current_page * this.state.rows_per_page - this.state.rows_per_page;
													let end = this.state.current_page * this.state.rows_per_page - 1;
													if (index >= start && index <= end) {
														return (
															<tr key={ index }>
																<td>{ Moment(history.createdAt).format("MM/DD/YYYY hh:mm:ss A") }</td>
																<td style={{ color: history.attempt === "Success" ? "#8cb203" : '#d62e0c' }}>{ history.attempt }</td>
																<td>{ history.lat }</td>
																<td>{ history.lng }</td>
																<td><button className="button grey-outset" onClick={ () => { this.onShowMap(history.lat, history.lng) } }><i className="fas fa-map-marked"></i> Show</button></td>
															</tr>
														)
													} else {
														return null;
													}
												})
											}
										</tbody>
									</table>
								</div>
								<div className="option">
									<button onClick={ () => { this.onDownload('csv') } } className="download button grey-outset"><i className="fas fa-file-csv"></i> Download CSV</button>
									<button onClick={ () => { this.onDownload('pdf') } } className="download button grey-outset"><i className="fas fa-file-pdf"></i> Download PDF</button>
									<label>Rows per page:</label>
									<select onChange={ this.onRowsPerPageChange }>
										<option value="10">10</option>
										<option value="50">50</option>
										<option value="100">100</option>
									</select>
									<span>{ (this.state.current_page * this.state.rows_per_page) - this.state.rows_per_page + 1 } - { this.state.current_page * this.state.rows_per_page } of { this.state.history.length }</span>
									<button className="navigator" onClick={ this.onPreviousPage } disabled={ this.state.current_page === 1 }><i className="fas fa-chevron-left"></i></button>
									<button className="navigator" onClick={ this.onNextPage} disabled={ this.state.current_page * this.state.rows_per_page >= this.state.history.length }><i className="fas fa-chevron-right"></i></button>
								</div>
							</div>
						</div>
						<div id="map" hidden={ this.state.isMapHidden }>
							<div className="overlay" onClick={ () => this.setState({ isMapHidden: true }) }></div>
							<iframe title="map" ref={ iframe => { this.map = iframe }}></iframe>
							<div className="close" onClick={ () => this.setState({ isMapHidden: true }) }><i className="fas fa-times-circle"></i></div>
						</div>
					</div>
				</div>
			)
		}
	}
}

export default LoginHistory;