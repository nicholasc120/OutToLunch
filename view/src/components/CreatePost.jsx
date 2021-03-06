import React, { Component } from "react";
import StarRatingComponent from "react-star-rating-component";
import Autosuggest from "react-autosuggest";
import {debounce} from "throttle-debounce";
import Loader from "react-loader-spinner";
import CSRFToken from "./CSRFToken.jsx";

class CreatePost extends Component {
  state = {
    form:{
      subject:'',
      content: '',
      rating: 0,
      imageFile: null,
      selected:{},
    },
    suggestions:[],
    value:'',
    oldValue:'',
    loading: false,
    submitted:false,
  };
  abortController = new window.AbortController();
  suggestions = [];

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    this.onSuggestionsFetchRequested = debounce(
      500, this.onSuggestionsFetchRequested
    );
  }

  componentWillUnmount() {
      this.abortController.abort();
  }

  onStarClick(nextValue, prevValue, name) {
    this.setState(state => (
        {
            form:{
                ...state.form,
                rating: nextValue
            }
        }
    ));
  }

  handleInputChange = (event) => {
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

  handleImageChange(e) {
        e.preventDefault();
        let reader = new FileReader();
        let file = e.target.files[0];
        reader.onloadend = () => {
            this.setState(state => ({
                form:{
                    ...state.form,
                    imageFile: file
                }
            }));
        };
        reader.readAsDataURL(file)
  }

  onChange = (event, { newValue }) => {
    this.setState({
        value: newValue
    });
  };

  getSuggestionValue = suggestion => {
    this.setState(state => (
        {
            form:{
                ...state.form,
                selected: suggestion
            }
        }
    ));

    return suggestion.title;
  };


  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  getSuggestions = value => {
    if (this.state.form.selected && Object.keys(this.state.form.selected).length > 0) {
        if (!(value === this.state.form.selected.title)) {
            this.setState({form:{selected: {}}});
        }
    }
    if (value === this.state.oldValue){
        return this.suggestions;
    }
    this.setState({oldValue: value});
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    if (inputLength > 0) {
        this.setState({loading:true});
        fetch(this.props.request + '/establishments/search/' + inputValue + '/', {
            method: 'GET',
            signal: this.abortController.signal,
        }).then(res => res.json())
            .then(data => {
                let foundEstablishments = [];
                if (data.data.length > 0) {
                    data.data.map(x => {
                        foundEstablishments = [
                            ...foundEstablishments,
                            {
                                id: x.id,
                                title: x.name,
                            }
                        ]
                    });
                    this.setState({suggestions:foundEstablishments});
                    this.suggestions = foundEstablishments;
                }
                this.setState({loading: false});
            })
            .catch(err => {
                if (err.name === 'AbortError') return;
                console.error("Error:", err)
            });
        return [];
    }
    return [];
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  renderSuggestion = suggestion => {
    return (
      <a className="dropdown-item">
        {suggestion.title}
      </a>);
  };

  showLoadingOnSearch(){
      if (this.state.loading){
          return (
              <div style={{position: "absolute", top: "7px", left: "5px"}}>
                  <Loader
                     type="Oval"
                     color="#17a2b8"
                     height={20}
                     width={20}
	                />
              </div>
          );
      }
      return (
          <img
            src="https://webstockreview.net/images/computer-clipart-magnifying-glass-13.png"
            style={{ height: "20px", position: "absolute", top: "7px", left: "5px" }}
          />
      );
  }

  showLoadingOnSubmit(){
      if (this.state.submitted){
          return(
               <div style={{
                  position: "absolute",
                  right: "10px"
                }}
               >
                  <Loader
                     type="Oval"
                     color="#17a2b8"
                     height={30}
                     width={30}
	                />
              </div>
          );
      }
      return(
          <button
            type="submit"
            style={{
              position: "absolute",
              right: "10px"
            }}
            className="btn btn-primary"
          >
            Post
          </button>
      );
  }

  handleSubmit(e) {
       e.preventDefault();
       if (!this.state.form.selected || Object.keys(this.state.form.selected).length === 0){
            alert("Please provide a valid establishment!");
            return;
       }
       if (this.state.form.rating < 1 || this.state.form.rating > 10){
           alert("Please provide a rating!");
           return;
       }
       let data = new FormData();
       let createForm = document.forms.createPost;
       data.append('image', this.state.form.imageFile);
       const content = {
         userId: this.props.userId,
         rating: this.state.form.rating,
         subject: this.state.form.subject,
         content: this.state.form.content,
         establishmentId: this.state.form.selected.id
       };
       data.append('content', JSON.stringify(content));
       this.setState({submitted: true});
       fetch(this.props.request + '/posts/create/', {
            method: 'POST',
            body: data,
            headers: {
                'X-CSRFToken':e.target.csrfmiddlewaretoken.value
            }
        }).then(res => res.json())
        .then(data => {
            if (data.success === "success"){
                alert("Successfully posted review!");
                this.setState({
                    form:{
                      subject:'',
                      content: '',
                      rating: 0,
                      imageFile: null,
                      selected:{},
                    },
                    suggestions:[],
                    value:'',
                    oldValue:'',
                    loading: false,
                    submitted: false
                });
                createForm.fileToUpload.value = '';
            }
        })
        .catch(err => {
            console.error("Error:", err)
        });
  };

  render() {
    const { value, suggestions } = this.state;
    const theme = {
      container: 'autosuggest border padding',
      input: 'form-control',
      suggestionsContainer: 'dropdown',
      suggestionsList: `dropdown-menu navbarsearchitem ${suggestions.length ? 'show' : ''}`,
      suggestion: '',
      suggestionFocused: 'active',
    };
    const inputProps = {
      placeholder: 'Find Establishment',
      value,
      onChange: this.onChange
    };
    return (
      <div className="background">
        <br/>
        <div className="container border post">
          <div className="row">
            <div className="col-sm">
              <div
                style={{
                  position: "absolute",
                  paddingTop: "10px",
                  paddingLeft: "20px"
                }}
              >
                <h2>Create New Review</h2>
                <form name="createPost" onSubmit={this.handleSubmit}>
                  <CSRFToken/>
                  <input
                    className="form-control"
                    type="text"
                    required
                    style={{ width: "700px" }}
                    placeholder="Title"
                    name="subject"
                    onChange={this.handleInputChange}
                    value={this.state.form.subject}
                  />
                  <br/>
                  <div style={{position: "relative", width: "540px" }}>
                      <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                        getSuggestionValue={this.getSuggestionValue}
                        renderSuggestion={this.renderSuggestion}
                        inputProps={inputProps}
                        theme={theme}
                      />
                      {this.showLoadingOnSearch()}
                  </div>
                  <StarRatingComponent
                    name="rating"
                    starCount={10}
                    value={this.state.form.rating}
                    onStarClick={this.onStarClick.bind(this)}
                  />
                  <br/>
                  <textarea
                    className="form-control"
                    name="content"
                    required
                    style={{ width: "700px", height: "200px", resize:"none"}}
                    placeholder="Write your review..."
                    onChange={this.handleInputChange}
                    value={this.state.form.content}
                  />
                  <br/>
                  <label htmlFor="fileToUpload">{"Image: "}</label>
                  <input
                    type="file"
                    accept="image/*"
                    name="fileToUpload"
                    id="fileToUpload"
                    onChange={(e) => this.handleImageChange(e)}
                  />
                  {this.showLoadingOnSubmit()}
                </form>
              </div>
            </div>
          </div>
        </div>
        <br/>
      </div>
    );
  }
}

export default CreatePost;
