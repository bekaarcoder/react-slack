import React, { Component } from "react";
import { connect } from "react-redux";
import { Menu, Icon } from "semantic-ui-react";
import {
  setCurrentChannel,
  setPrivateChannel,
  setActiveChannel,
} from "../../actions";
import firebase from "../../firebase";

class Starred extends Component {
  state = {
    starredChannels: [],
    usersRef: firebase.firestore().collection("users"),
    currentUser: this.props.currentUser,
  };

  componentDidMount() {
    this.addStarredListeners();
  }

  addStarredListeners = () => {
    const { currentUser, usersRef } = this.state;
    usersRef
      .doc(currentUser.uid)
      .collection("favourites")
      .onSnapshot((snapshot) => {
        let loadedChannels = [];
        snapshot.forEach((doc) => {
          loadedChannels.push(doc.data());
        });
        this.setState({
          starredChannels: loadedChannels,
        });
      });
  };

  setChannel = (channel) => {
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.props.setActiveChannel(channel.id);
  };

  render() {
    const { starredChannels } = this.state;
    const { activeChannel } = this.props;
    return (
      <Menu inverted vertical style={{ paddingTop: "1.2em", fontSize: "1em" }}>
        <Menu.Item>
          <span>
            <Icon name="star" />
          </span>
          FAVOURITES ({starredChannels.length})
        </Menu.Item>
        {starredChannels.length > 0 &&
          starredChannels.map((channel) => (
            <Menu.Item
              name={channel.name}
              key={channel.id}
              active={activeChannel === channel.id}
              onClick={() => this.setChannel(channel)}
            >
              # {channel.name}
            </Menu.Item>
          ))}
      </Menu>
    );
  }
}

const mapStateToProps = (state) => ({
  activeChannel: state.channel.activeChannel,
});

export default connect(mapStateToProps, {
  setCurrentChannel,
  setPrivateChannel,
  setActiveChannel,
})(Starred);
