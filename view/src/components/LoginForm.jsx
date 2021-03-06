import React from "react";
import CSRFToken from "./CSRFToken.jsx";
import Loader from 'react-loader-spinner'
import { withRouter } from "react-router-dom";

class LoginForm extends React.Component {
  state = {
    loading: false
  };

  constructor(props) {
    super(props);
    this.state = { form: { username: "", password: "" }};
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState(state => ({
      form: {
        ...state.form,
        [name]: value
      }
    }));
  };

  handleSubmit = event => {
    event.preventDefault();
    this.setState({loading: true});
    const values = this.state.form;
    let url = this.props.props.url + '/auth/login/';
    fetch(url, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": event.target.csrfmiddlewaretoken.value
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          this.setState({loading: false});
          this.props.props.login(data.user);
        } else {
          alert(data.status);
          if (data.redirect){
              this.props.history.push(data.redirect);
          }
        }
      })
      .catch(err => console.error("Error:", err));
  };

  spinnerWhenLoading() {
      if (this.state.loading){
          return (
                <div style={{ paddingLeft: "350px" }}>
                    <Loader
                     type="Oval"
                     color="#17a2b8"
                     height={100}
                     width={100}
	                />
                </div>
              );
      }
      else{
        return (
            <button type="submit" className="btn btn-primary">
            Sign in
          </button>
        );
      }
  }

  render() {
    return (
      <React.Fragment>
        <div className="container post">
          <div className="row">
            <div className="col-sm">
        <form className="p-4" onSubmit={this.handleSubmit}>
          <CSRFToken />
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              placeholder="Username"
              onChange={this.handleInputChange}
              required
            />
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              id="password"
              placeholder="Password"
              onChange={this.handleInputChange}
              required
            />
          </div>
          {this.spinnerWhenLoading()}
        </form>
        </div>
            </div>
          </div>
      </React.Fragment>
    );
  }
}

export default withRouter(LoginForm);
