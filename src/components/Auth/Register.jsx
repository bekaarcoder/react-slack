import React, { Component } from "react";
import {
  Grid,
  Segment,
  Header,
  Icon,
  Form,
  Button,
  Message,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import validator from "validator";
import md5 from "md5";
import { isEmpty } from "../../validators/isEmpty";
import firebase from "../../firebase";

class Register extends Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    errors: {},
    loading: false,
    usersRef: firebase.firestore().collection("users"),
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  isFormValid = () => {
    let error = {};
    const { err, isValid } = this.isFormEmpty(this.state);
    if (!isValid) {
      this.setState({ errors: err });
      return false;
    } else if (!validator.isEmail(this.state.email)) {
      error.email = "Please enter a valid email address.";
      this.setState({ errors: error });
      return false;
    } else if (this.state.password.length < 6) {
      error.password = "Password should be atleast 6 characters.";
      this.setState({ errors: error });
      return false;
    } else if (this.state.password !== this.state.passwordConfirm) {
      error.passwordConfirm = "Password does not match.";
      this.setState({ errors: error });
      return false;
    } else {
      return true;
    }
  };

  isFormEmpty = ({ username, email, password, passwordConfirm }) => {
    let err = {};
    if (validator.isEmpty(username)) {
      err.username = "Username should not be empty.";
    }
    if (validator.isEmpty(email)) {
      err.email = "Email should not be empty.";
    }
    if (validator.isEmpty(password)) {
      err.password = "Password should not be empty.";
    }
    if (validator.isEmpty(passwordConfirm)) {
      err.passwordConfirm = "Password does not match.";
    }
    return {
      err,
      isValid: isEmpty(err),
    };
  };

  saveUser = (createdUser) => {
    return this.state.usersRef.doc(createdUser.user.uid).set({
      username: createdUser.user.displayName,
      avatar: createdUser.user.photoURL,
      email: createdUser.user.email,
    });
  };

  onSubmit = (e) => {
    let err = {};
    e.preventDefault();
    if (this.isFormValid()) {
      this.setState({
        errors: {},
        loading: true,
      });
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then((createdUser) => {
          console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `https://www.gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=robohash`,
            })
            .then(() => {
              this.saveUser(createdUser)
                .then(() => {
                  console.log("Profile Created");
                })
                .catch((err) => {
                  console.log(err);
                });
              this.setState({
                username: "",
                email: "",
                password: "",
                passwordConfirm: "",
                errors: {},
                loading: false,
              });
            });
        })
        .catch((error) => {
          console.log(error);
          err.message = error.message;
          this.setState({
            errors: err,
            loading: false,
          });
        });
    }
  };

  render() {
    const {
      username,
      email,
      password,
      passwordConfirm,
      errors,
      loading,
    } = this.state;
    const emailError =
      errors.message && errors.message.toLowerCase().includes("email")
        ? "error"
        : "";
    return (
      <Grid centered textAlign="center" verticalAlign="middle" className="app">
        <Grid.Row>
          <Grid.Column width={6}>
            <Segment className="attached">
              <Header as="h2" textAlign="center" color="teal">
                <Icon name="bullhorn" />
                Register for SlackChat
              </Header>
              <Form
                style={{ marginTop: "30px" }}
                onSubmit={this.onSubmit}
                error
              >
                {errors && <Message error>{errors.message}</Message>}
                <Form.Input
                  error={errors.username}
                  fluid
                  label="Username"
                  type="text"
                  placeholder="Username"
                  name="username"
                  onChange={this.handleChange}
                  value={username}
                  icon="user"
                  iconPosition="left"
                />
                <Form.Input
                  error={errors.email}
                  fluid
                  label="Email Address"
                  type="text"
                  placeholder="Email Address"
                  name="email"
                  onChange={this.handleChange}
                  value={email}
                  className={emailError}
                  icon="mail"
                  iconPosition="left"
                />
                <Form.Input
                  error={errors.password}
                  fluid
                  label="Password"
                  type="password"
                  placeholder="Password"
                  name="password"
                  onChange={this.handleChange}
                  value={password}
                  icon="lock"
                  iconPosition="left"
                />
                <Form.Input
                  error={errors.passwordConfirm}
                  fluid
                  label="Password Confirm"
                  type="password"
                  placeholder="Password Confirm"
                  name="passwordConfirm"
                  onChange={this.handleChange}
                  value={passwordConfirm}
                  icon="repeat"
                  iconPosition="left"
                />
                <Button
                  icon
                  labelPosition="right"
                  color="teal"
                  loading={loading}
                  disabled={loading}
                >
                  Submit
                  <Icon name="arrow right" />
                </Button>
              </Form>
            </Segment>
            <Message warning>
              <Icon name="help circle" />
              Already registered ? <Link to="/login">Login Here</Link> instead.
            </Message>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default Register;
