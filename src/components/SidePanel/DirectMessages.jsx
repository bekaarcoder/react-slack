import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";

class DirectMessages extends Component {
  state = {
    user: this.props.currentUser,
    users: [],
    usersRef: firebase.firestore().collection("users"),
    connectedRef: firebase.database().ref(".info/connected"),
    databasePresenceRef: firebase.database().ref("status"),
    activeChannel: "",
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid);
    }
  }

  addListener = (uid) => {
    this.state.usersRef.onSnapshot((snapshot) => {
      let loadedUsers = [];
      snapshot.forEach((doc) => {
        if (doc.id !== uid) {
          loadedUsers.push({ ...doc.data(), uid: doc.id, status: "offline" });
        }
      });
      this.setState({ users: loadedUsers });
    });

    this.state.connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        const ref = this.state.databasePresenceRef.child(uid);
        ref.set(true);
        ref.onDisconnect().remove((err) => {
          if (err !== null) {
            console.log(err);
          }
        });
      }
    });

    this.state.databasePresenceRef.on("child_added", (snap) => {
      if (uid !== snap.key) {
        this.setUserStatus(snap.key, "online");
      }
    });

    this.state.databasePresenceRef.on("child_removed", (snap) => {
      if (uid !== snap.key) {
        this.setUserStatus(snap.key, "offline");
      }
    });
  };

  setUserStatus = (uid, status) => {
    const updatedUsers = this.state.users.map((user) => {
      if (user.uid === uid) {
        return { ...user, status: status };
      }
      return user;
    });
    this.setState({ users: updatedUsers });
  };

  changeChannel = (user) => {
    console.log(user);
    const currentUserId = this.state.user.uid;
    let channelId;
    let docId;
    if (user.uid < currentUserId) {
      channelId = user.uid;
      docId = currentUserId;
    } else {
      channelId = currentUserId;
      docId = user.uid;
    }
    const channelData = {
      id: channelId,
      name: user.username,
      docId: docId,
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
  };

  setActiveChannel = (uid) => {
    this.setState({ activeChannel: uid });
  };

  render() {
    const { users, activeChannel } = this.state;
    return (
      <Menu inverted vertical style={{ paddingTop: "1em", fontSize: "1em" }}>
        <Menu.Item>
          <span>
            <Icon name="mail" />
          </span>
          MESSAGES (0)
        </Menu.Item>
        {users.length > 0 &&
          users.map((user) => (
            <Menu.Item
              name={user.username}
              key={user.uid}
              active={activeChannel === user.uid}
              onClick={() => this.changeChannel(user)}
            >
              {user.username}
              <Icon
                name="circle"
                color={user.status === "online" ? "green" : "red"}
                size="small"
              />
            </Menu.Item>
          ))}
      </Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  DirectMessages
);
