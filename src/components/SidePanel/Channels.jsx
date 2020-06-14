import React, { Component, Fragment } from "react";
import { Menu, Icon, Modal, Form, Button, Label } from "semantic-ui-react";
import { connect } from "react-redux";
import {
  setCurrentChannel,
  setPrivateChannel,
  setActiveChannel,
} from "../../actions";
import firebase from "../../firebase";
import validator from "validator";

class Channels extends Component {
  state = {
    channel: null,
    channels: [],
    modal: false,
    channelName: "",
    channelDescription: "",
    errors: {},
    channelRef: firebase.firestore().collection("channels"),
    messageRef: firebase.firestore().collection("channelMessages"),
    typingRef: firebase.database().ref("typing"),
    notifications: [],
    user: this.props.currentUser,
    loading: false,
    firstLoad: true,
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    console.log("unmount");
    this.removeListeners();
  }

  unsubscribe = null;

  addListeners = () => {
    this.unsubscribe = this.state.channelRef.onSnapshot((snapshot) => {
      console.log(snapshot);
      let loadedChannels = [];
      snapshot.forEach((doc) => {
        loadedChannels.push({ ...doc.data(), id: doc.id });
        this.addNotificationListener(doc.id);
      });
      console.log(loadedChannels);
      this.setState({ channels: loadedChannels }, () =>
        this.setDefaultChannel()
      );
    });
  };

  addNotificationListener = (channelId) => {
    this.state.messageRef
      .doc(channelId)
      .collection("messages")
      .onSnapshot((snapshot) => {
        if (this.state.channel) {
          this.handleNotifications(
            channelId,
            this.state.channel.id,
            this.state.notifications,
            snapshot
          );
        }
      });
  };

  handleNotifications = (
    channelId,
    currentChannelId,
    notifications,
    snapshot
  ) => {
    let lastTotal = 0;
    let index = notifications.findIndex(
      (notification) => notification.id === channelId
    );
    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snapshot.size - lastTotal > 0) {
          notifications[index].count = snapshot.size - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snapshot.size;
    } else {
      notifications.push({
        id: channelId,
        total: snapshot.size,
        lastKnownTotal: snapshot.size,
        count: 0,
      });
    }

    this.setState({
      notifications: notifications,
    });
  };

  removeListeners = () => {
    this.unsubscribe();
  };

  setDefaultChannel = () => {
    if (this.state.channels.length > 0 && this.state.firstLoad) {
      this.setChannel(this.state.channels[0]);
    }
    this.setState({ firstLoad: false });
  };

  setChannel = (channel) => {
    if (this.state.channel) {
      this.state.typingRef
        .child(this.state.channel.id)
        .child(this.state.user.uid)
        .remove();
    }
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.clearNotifications();
    // this.setState({ activeChannel: channel.id });
    this.props.setActiveChannel(channel.id);
    this.setState({ channel: channel });
    console.log(this.state.channel);
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.state.channel.id
    );

    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  getNotificationCount = (channel) => {
    let count = 0;
    this.state.notifications.forEach((notification) => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });
    if (count > 0) {
      return count;
    }
  };

  openModal = () => {
    this.setState({
      modal: true,
    });
  };

  closeModal = () => {
    this.setState({
      modal: false,
      channelName: "",
      channelDescription: "",
    });
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  isFormValid = () => {
    let error = {};
    if (validator.isEmpty(this.state.channelName)) {
      error.channelName = "Channel Name cannot be empty";
      this.setState({ errors: error });
      return false;
    } else if (validator.isEmpty(this.state.channelDescription)) {
      error.channelDescription = "Channel Description cannot be empty";
      this.setState({
        errors: error,
      });
      return false;
    } else if (!validator.isLength(this.state.channelName, { min: 3 })) {
      error.channelName = "Channel Name is shorter";
      this.setState({ errors: error });
      return false;
    } else if (!validator.isLength(this.state.channelDescription, { min: 6 })) {
      error.channelDescription = "Channel Description is shorter";
      this.setState({ errors: error });
      return false;
    } else {
      return true;
    }
  };

  handleSubmit = (e) => {
    const { channelName, channelDescription, user, channelRef } = this.state;
    e.preventDefault();
    if (this.isFormValid()) {
      this.setState({
        loading: true,
      });
      const newChannel = {
        name: channelName,
        description: channelDescription,
        createdBy: {
          username: user.displayName,
          avatar: user.photoURL,
        },
      };
      channelRef
        .add(newChannel)
        .then((doc) => {
          console.log(`Channel created ${doc.id}`);
          this.setState({ loading: false });
          this.closeModal();
        })
        .catch((err) => {
          console.log(err);
          this.setState({ loading: false });
        });
    }
  };

  render() {
    const {
      channels,
      modal,
      channelName,
      channelDescription,
      errors,
      loading,
    } = this.state;
    const { activeChannel } = this.props;
    return (
      <Fragment>
        <Menu
          inverted
          vertical
          style={{ paddingTop: "1.2em", fontSize: "1em" }}
        >
          <Menu.Item>
            <span>
              <Icon name="exchange" />
            </span>
            CHANNELS ({channels.length})
            <Icon
              name="add circle"
              color="teal"
              inverted
              onClick={this.openModal}
            />
          </Menu.Item>
          {channels.length > 0 &&
            channels.map((channel) => (
              <Menu.Item
                name={channel.name}
                key={channel.id}
                active={activeChannel === channel.id}
                onClick={() => this.setChannel(channel)}
              >
                {this.getNotificationCount(channel) && (
                  <Label color="teal">
                    {this.getNotificationCount(channel)}
                  </Label>
                )}
                # {channel.name}
              </Menu.Item>
            ))}
        </Menu>

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form inverted onSubmit={this.handleSubmit} error>
              <Form.Input
                error={errors.channelName}
                fluid
                label="Channel Name"
                type="text"
                placeholder="Channel Name"
                name="channelName"
                onChange={this.handleChange}
                value={channelName}
              />
              <Form.Input
                error={errors.channelDescription}
                fluid
                label="Channel Description"
                type="text"
                placeholder="Channel Description"
                name="channelDescription"
                onChange={this.handleChange}
                value={channelDescription}
              />
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button
              color="red"
              inverted
              onClick={this.closeModal}
              disabled={loading}
            >
              <Icon name="remove" /> Cancel
            </Button>
            <Button
              color="green"
              inverted
              onClick={this.handleSubmit}
              loading={loading}
              disabled={loading}
            >
              <Icon name="checkmark" /> Add
            </Button>
          </Modal.Actions>
        </Modal>
      </Fragment>
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
})(Channels);
