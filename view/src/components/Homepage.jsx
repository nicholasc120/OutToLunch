import React, { Component } from "react";
import HomepagePost from "./HomepagePost.jsx";
import Post from "./Post.jsx";
import "./styles.css";
import { Link, Switch, Route, withRouter } from "react-router-dom";
import Loader from 'react-loader-spinner'

class Homepage extends Component {
  moreData = true;
  page = 0;
  state = {
      loading: true,
      posts: []
  };
  abortController = new window.AbortController();

  constructor(props){
      super(props);
      this.retrievePosts();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
      if (this.props.url !== prevProps.url) {
          this.page = 0;
          this.moreData = true;
          this.setState({posts: [], loading:true});
          this.retrievePosts();
      }
  }

  componentDidMount() {
       window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
      window.removeEventListener('scroll', this.handleScroll);
      this.abortController.abort();
  }

  handleScroll = () => {
     if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight-5 && !this.state.loading && this.moreData) {
         this.setState({loading: true});
         this.retrievePosts();
    }
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
  }

  retrievePosts = () => {
      fetch(this.props.request+'/posts'+this.props.url+this.page+'/', {
            method: 'GET',
            signal: this.abortController.signal,
        }).then(res => res.json())
        .then(data => {
            this.setState({loading:false});
            if (data.data.length > 0) {
                data.data.map(x => {
                    this.setState(state => ({
                        posts: [
                            ...state.posts,
                            {
                                postId: x.post_id,
                                userId: x.user_id,
                                establishmentId: x.establishment_id,
                                username: x.username,
                                userImage: x.user_image,
                                date: x.post_date,
                                content: x.post_content,
                                photo: x.post_photo_location,
                                establishmentName: x.establishment_name,
                                rating: x.post_rating,
                                subject: x.post_subject,
                                upvotes: x.upvote,
                                downvotes: x.downvote,
                                comments: x.count
                            }
                        ]
                    }));
                });
                this.page += 1;
            }
            else {
                this.moreData = false;
            }
        }).catch(err => {
            if (err.name === 'AbortError') return;
            console.error("Error:", err)});
  };


  showThePostReviewButtonIfLoggedIn() {
    if (this.props.loggedIn === true) {
      return (
        <Link to="/create-post/">
          <button
            className="btn btn-secondary"
            style={{ position: "absolute", right: "10px" }}
          >
            Post New Review
          </button>
        </Link>
      );
    }
  }

  render() {
    return (
        <Switch>
          <Route path="/post/:id/edit/" render={(props) => {
              const post = this.state.posts.find(post => post.postId === props.match.params.id);
              return (<Post post={post}
                            id={props.match.params.id}
                            request={this.props.request}
                            currentUser={this.props.user}
                            edit={true}
                        />);
          }}/>
          <Route path="/post/:id/" render={(props) => {
              const post = this.state.posts.find(post => post.postId === props.match.params.id);
              return (<Post post={post}
                            id={props.match.params.id}
                            request={this.props.request}
                            currentUser={this.props.user}
                            edit={false}
                        />);
          }}/>
          <Route>
              <div className="background">
                <b style={{ paddingLeft: "350px" }}>{this.props.header}</b>
                {this.showThePostReviewButtonIfLoggedIn()}
                <br />
                {this.state.posts.map((post, index) => (
                  <HomepagePost
                    currentUser={this.props.user}
                    key={index}
                    postId={post.postId}
                    userId = {post.userId}
                    username={post.username}
                    userImage = {post.userImage}
                    establishmentName = {post.establishmentName}
                    date = {post.date}
                    content = {post.content}
                    photo = {post.photo}
                    rating = {post.rating}
                    subject = {post.subject}
                    upvotes = {post.upvotes}
                    downvotes = {post.downvotes}
                    comments = {post.comments}
                    request = {this.props.request}
                  />
                ))}
                {this.spinnerWhenLoading()}
              </div>
          </Route>
        </Switch>
    );
  }
}

export default withRouter(Homepage);
