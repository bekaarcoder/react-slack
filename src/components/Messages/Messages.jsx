import React, { Component, Fragment } from "react";
import { Comment, Segment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessagesForm from "./MessagesForm";
import firebase from "../../firebase";
import Message from "./Message";

class Messages extends Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    currentChannel: this.props.currentChannel,
    currentUser: this.props.currentUser,
    messageRef: firebase.firestore().collection("channelMessages"),
    privateMessageRef: firebase.firestore().collection("privateMessages"),
    usersRef: firebase.firestore().collection("users"),
    channelMessages: [],
    uniqueUsers: 0,
    messagesLoaded: false,
    searchTerm: "",
    searchResults: [],
    isChannelStarred: false,
  };

  componentDidMount() {
    const { currentChannel, currentUser } = this.state;

    if (currentChannel && currentUser) {
      this.addMessageListener(currentChannel);
      this.addUserFavouritesListener(currentChannel.id, currentUser.uid);
    }
  }

  addUserFavouritesListener = (channelId, userId) => {
    this.state.usersRef
      .doc(userId)
      .collection("favourites")
      .doc(channelId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          this.setState({ isChannelStarred: true });
        } else {
          this.setState({ isChannelStarred: false });
        }
      });
  };

  addMessageListener = (channel) => {
    const { privateChannel, messageRef, privateMessageRef } = this.state;
    let ref;
    let docName;
    if (privateChannel) {
      ref = privateMessageRef;
      docName = channel.docId;
    } else {
      ref = messageRef;
      docName = "messages";
    }

    ref
      .doc(channel.id)
      .collection(docName)
      .orderBy("timestamp", "asc")
      .onSnapshot(
        (snapshot) => {
          let messages = [];
          snapshot.forEach((doc) => {
            messages.push({
              ...doc.data(),
              id: doc.id,
            });
          });
          const users = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.id)) {
              acc.push(message.user.id);
            }
            return acc;
          }, []);
          this.setState({
            channelMessages: messages,
            messagesLoaded: true,
            uniqueUsers: users.length,
          });
        },
        (error) => {
          console.log(error);
        }
      );
  };

  displayMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <Message
        channelMessage={message}
        key={message.id}
        currentUser={this.state.currentUser}
      />
    ));

  handleSearch = (e) => {
    this.setState(
      {
        searchTerm: e.target.value,
      },
      () => this.searchMessages()
    );
  };

  searchMessages = () => {
    const messages = [...this.state.channelMessages];
    const regex = new RegExp(this.state.searchTerm.replace(/\\/g, ""), "gi");
    const searchResults = messages.reduce((acc, message) => {
      if (
        (message.message && message.message.match(regex)) ||
        message.user.displayName.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({
      searchResults: searchResults,
    });
  };

  handleStar = () => {
    this.setState(
      {
        isChannelStarred: !this.state.isChannelStarred,
      },
      () => {
        this.starChannel();
      }
    );
  };

  starChannel = () => {
    const { usersRef, currentUser, currentChannel } = this.state;
    if (this.state.isChannelStarred) {
      usersRef
        .doc(currentUser.uid)
        .collection("favourites")
        .doc(currentChannel.id)
        .set(currentChannel)
        .then(() => {
          console.log("Channel Starred");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      usersRef
        .doc(currentUser.uid)
        .collection("favourites")
        .doc(currentChannel.id)
        .delete()
        .then(() => {
          console.log("Removed Channel from favourites");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  render() {
    const {
      currentChannel,
      currentUser,
      channelMessages,
      uniqueUsers,
      messagesLoaded,
      searchTerm,
      searchResults,
      privateChannel,
      isChannelStarred,
    } = this.state;
    return (
      <Fragment>
        <MessagesHeader
          channel={currentChannel}
          uniqueUsers={uniqueUsers}
          handleSearch={this.handleSearch}
          privateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />
        <Segment>
          <Comment.Group className="messages" style={{ maxWidth: 900 }}>
            {messagesLoaded &&
              (searchTerm
                ? this.displayMessages(searchResults)
                : this.displayMessages(channelMessages))}
          </Comment.Group>
        </Segment>
        <MessagesForm
          currentChannel={currentChannel}
          currentUser={currentUser}
          privateChannel={privateChannel}
        />
      </Fragment>
    );
  }
}

export default Messages;