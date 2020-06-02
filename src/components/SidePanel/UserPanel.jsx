import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Header, Icon, Dropdown, Image } from "semantic-ui-react";
import firebase from "../../firebase";

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    isLoaded: false,
  };

  componentDidMount() {
    this.setState({
      user: this.props.user,
      isLoaded: true,
    });
  }

  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("signed out");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const { user, isLoaded } = this.state;
    console.log(user);
    return (
      isLoaded && (
        <Grid>
          <Grid.Column>
            <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
              <Header as="h2" floated="left" inverted>
                <Icon name="code" />
                <Header.Content>SlackChat</Header.Content>
              </Header>
            </Grid.Row>
            <Grid.Row style={{ marginTop: "1.2em" }}>
              <Header style={{ padding: "0.5em" }} as="h4" inverted>
                <Dropdown
                  trigger={
                    <span>
                      <Image
                        src={user && user.photoURL}
                        spaced="right"
                        avatar
                        bordered
                      />
                      {user && user.displayName}
                    </span>
                  }
                >
                  <Dropdown.Menu>
                    <Dropdown.Item
                      text={`Signed in as ${user && user.displayName}`}
                      disabled
                    />
                    <Dropdown.Item text="Change Avatar" />
                    <Dropdown.Item
                      text="Sign Out"
                      onClick={this.handleSignOut}
                    />
                  </Dropdown.Menu>
                </Dropdown>
              </Header>
            </Grid.Row>
          </Grid.Column>
        </Grid>
      )
    );
  }
}

const maspStateToProps = (state) => ({
  user: state.user.currentUser,
});

export default connect(maspStateToProps, {})(UserPanel);
