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
import firebase from "../../firebase";
import validator from "validator";
import { isEmpty } from "../../validators/isEmpty";

class Login extends Component {
  state = {
    email: "",
    password: "",
    errors: {},
    loading: false,
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  isFormValid = () => {
    let err = {};
    const { error, isValid } = this.isFormEmpty(this.state);
    if (!isValid) {
      this.setState({
        errors: error,
      });
      return false;
    } else if (!validator.isEmail(this.state.email)) {
      err.email = "Please enter a valid email address.";
      this.setState({ errors: err });
    } else {
      return true;
    }
  };

  isFormEmpty = ({ email, password }) => {
    let error = {};
    if (validator.isEmpty(email)) {
      error.email = "Email Address cannot be empty.";
    }
    if (validator.isEmpty(password)) {
      error.password = "Password cannot be empty.";
    }

    return {
      error,
      isValid: isEmpty(error),
    };
  };

  onSubmit = (e) => {
    let error = {};
    e.preventDefault();
    if (this.isFormValid()) {
      this.setState({
        loading: true,
      });
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then((signedInUser) => {
          // console.log(signedInUser);
          this.setState({
            loading: false,
            email: "",
            password: "",
            errors: {},
          });
        })
        .catch((err) => {
          console.log(err);
          error.message = err.message;
          this.setState({
            errors: error,
            loading: false,
          });
        });
    }
  };

  render() {
    const { email, password, errors, loading } = this.state;
    return (
      <Grid centered textAlign="center" verticalAlign="middle" className="app">
        <Grid.Row>
          <Grid.Column width={6}>
            <Segment className="attched">
              <Header as="h2" textAlign="center" color="teal">
                <Icon name="bullhorn" />
                Login To SlackChat
              </Header>
              <Form
                style={{ marginTop: "30px" }}
                onSubmit={this.onSubmit}
                error
              >
                {errors && <Message error>{errors.message}</Message>}
                <Form.Input
                  error={errors.email}
                  fluid
                  label="Email Address"
                  type="text"
                  placeholder="Email Address"
                  name="email"
                  value={email}
                  onChange={this.handleChange}
                  icon="mail"
                  iconPosition="left"
                  className={
                    errors.message &&
                    errors.message.toLowerCase().includes("user")
                      ? "error"
                      : ""
                  }
                />
                <Form.Input
                  error={errors.password}
                  fluid
                  label="Password"
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={password}
                  onChange={this.handleChange}
                  icon="lock"
                  iconPosition="left"
                  className={
                    errors.message &&
                    errors.message.toLowerCase().includes("password")
                      ? "error"
                      : ""
                  }
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
              Not a registered user ? <Link to="/register">
                Register Here
              </Link>{" "}
              instead.
            </Message>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default Login;
