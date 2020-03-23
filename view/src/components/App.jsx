import React, { Component } from "react";
import {Switch, Route, Redirect, withRouter} from "react-router-dom";
import { ModalRoute, ModalContainer } from "react-router-modal";
import LoginForm from "./LoginForm.jsx"
import "./App.css"
import "./styles.css"
import "react-router-modal/css/react-router-modal.css"
import NavBar from "./navigation/NavBar.jsx";
import CreateAccount from "./CreateAccount.jsx";
import Logout from "./Logout.jsx"
import Homepage from "./Homepage.jsx";
import CreatePost from "./createPost.jsx";
import SideBar from "./navigation/SideBar.jsx";

class App extends Component {

    constructor(props) {
        super(props);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.setLogout = this.setLogout.bind(this);
        this.initButtons = this.initButtons.bind(this);
    }

    state = {
        url:this.props.url,
        navLinks:[
            {id:'login', text:'Login', component:LoginForm, props:{login:this.login, url:this.props.url}},
            {id:'create-account', text:'Create Account', component:CreateAccount, props:{url:this.props.url}},
        ],
        location:this.props.location.pathname,
        loggedIn:false //You can make this true by default for testing everything with the user as logged in.
    };

    initButtons() {
        let url = this.state.url + '/auth/status/';
        fetch(url, {
            method: 'GET',
        }).then(res => res.json())
            .then(data => {
                if (data.status==='user'){
                    this.login();
                }
                else{
                    this.setLogout();
                }
            })
            .catch(err => console.error("Error:", err));
    };

    login() {
        this.setState({
            navLinks: [{id: "logout", text: "Logout", component: Logout, props: {logout: this.logout, url:this.state.url}}],
            loggedIn:true
        });
    }


    logout(){
        let url = this.state.url + '/auth/logout/';
        fetch(url, {
            method:"GET"
        }).then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    this.setLogout();
                }
            });
    }

    setLogout(){
        this.setState({
            navLinks:[
                {id:'login', text:'Login', component:LoginForm, props:{login:this.login, url:this.props.url}},
                {id:'create-account', text:'Create Account', component:CreateAccount, props:{url:this.props.url}}
                ],
            loggedIn:false
        });
    }

    render() {
        return (
            <React.Fragment>
                    <NavBar
                        initButtons={this.initButtons}
                        navLinks={this.state.homeLinks}
                        buttonLinks={this.state.navLinks}/>
                    <div className='homepage'>
                        <SideBar /> {/*TODO Sidebar needs to receive the options it lists as props as these will change with the user's status.*/}
                    </div>
                    <Switch>
                        {this.state.navLinks.map(link => (
                            <Route
                                key={link.id}
                                exact path={"/" + link.id}
                                render={() => (
                                    <React.Fragment>
                                        <div className="homepage">
                                            <link.component props={link.props}/>
                                        </div>
                                    </React.Fragment>
                                )}
                            />
                        ))}
                        <Route path="/create-post">
                            <div className="homepage">
                                <CreatePost/>
                            </div>
                        </Route>
                        <Route path="/">
                            <div className="homepage">
                            <Homepage loggedIn={this.state.loggedIn}/>
                            </div>
                        </Route>
                        <Route>
                            <Redirect push to="/"/>
                        </Route>
                    </Switch>
                    <ModalContainer/>
            </React.Fragment>

        );
    }
}

export default withRouter(App);
