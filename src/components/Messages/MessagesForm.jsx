import React, { Component } from "react";
import { Segment, Input, Button, Popup } from "semantic-ui-react";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import firebase from "../../firebase";
import UploadModal from "./UploadModal";

class MessagesForm extends Component {
  state = {
    message: "",
    messageRef: firebase.firestore().collection("channelMessages"),
    privateMessageRef: firebase.firestore().collection("privateMessages"),
    privateChannel: this.props.privateChannel,
    loading: false,
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    error: false,
    modalOpen: false,
    storageRef: firebase.storage().ref(),
    uploadStatus: false,
    typingRef: firebase.database().ref("typing"),
    emojiPicker: false,
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  openModal = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  uploadFile = (file, metadata) => {
    const { privateChannel } = this.state;
    let name = file.name.split(".");
    let extension = name[name.length - 1];
    const filename = "media_" + Date.now();
    const filePath = privateChannel
      ? `privateChat/images/${filename}.${extension}`
      : `images/${filename}.${extension}`;
    const uploadTask = this.state.storageRef
      .child(filePath)
      .put(file, metadata);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log("Uploading image...");
        this.setState({ uploadStatus: true });
      },
      (error) => {
        console.log(error);
        this.setState({ uploadStatus: false });
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log("File uploaded", downloadURL);
          const mediaURL = downloadURL;
          this.sendMessage(mediaURL);
          this.closeModal();
        });
      }
    );
  };

  sendMessage = (mediaUrl = null) => {
    const { user, message } = this.state;
    let new_message = {};
    if (message.length > 0) {
      this.setState({ loading: true, error: false });
      new_message = {
        message: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        user: {
          displayName: user.displayName,
          avatar: user.photoURL,
          id: user.uid,
        },
      };
      this.uploadMessage(new_message);
    } else if (mediaUrl !== null) {
      this.setState({ uploadStatus: true });
      new_message = {
        mediaURL: mediaUrl,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        user: {
          displayName: user.displayName,
          avatar: user.photoURL,
          id: user.uid,
        },
      };
      this.uploadMessage(new_message);
    } else {
      this.setState({
        error: true,
      });
    }
  };

  uploadMessage = (message) => {
    const {
      channel,
      messageRef,
      privateMessageRef,
      privateChannel,
      typingRef,
      user,
    } = this.state;

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
      .add(message)
      .then((doc) => {
        console.log(`Message Sent ${doc.id}`);
        this.setState({ loading: false, message: "", uploadStatus: false });
        typingRef.child(channel.id).child(user.uid).remove();
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false, error: true, uploadStatus: false });
      });
  };

  handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.sendMessage();
    }
    const { message, channel, user, typingRef } = this.state;
    if (message.length !== 0) {
      typingRef.child(channel.id).child(user.uid).set(user.displayName);
    } else {
      typingRef.child(channel.id).child(user.uid).remove();
    }
  };

  // colonToUnicode = (message) => {
  //   return message.replace(/:[A-Za-z0-9_+-]+:/g, (x) => {
  //     x = x.replace(/:/g, "");
  //     let emoji = emojiIndex.emojis[x];
  //     console.log(emojiIndex.emojis.x);
  //     if (typeof emoji !== "undefined") {
  //       let unicode = emoji.native;
  //       if (typeof unicode !== "undefined") {
  //         return unicode;
  //       }
  //     }
  //     x = ":" + x + ":";
  //     return x;
  //   });
  // };

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  handleAddEmoji = (emoji) => {
    const oldMessage = this.state.message;
    const newMessage = `${oldMessage} ${emoji.native} `;
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  render() {
    const {
      message,
      error,
      loading,
      modalOpen,
      uploadStatus,
      emojiPicker,
    } = this.state;
    return (
      <Segment className="msg_form">
        {emojiPicker && (
          <Picker
            set="twitter"
            className="emoji_picker"
            title="Pick Emoji"
            emoji="point_up"
            onSelect={this.handleAddEmoji}
          />
        )}
        <Input
          placeholder="Add a message"
          fluid
          action
          labelPosition="left"
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          value={message}
          name="message"
          error={error}
          ref={(node) => (this.messageInputRef = node)}
        >
          <Button
            icon={emojiPicker ? "close" : "add"}
            content={emojiPicker ? "Close" : null}
            style={{ margin: 0 }}
            onClick={this.handleTogglePicker}
          />
          <input />
          <Button
            icon="send"
            color="teal"
            onClick={this.sendMessage}
            loading={loading}
          />
          <Popup
            trigger={
              <Button
                icon="cloud upload"
                color="red"
                onClick={this.openModal}
              />
            }
            content="Upload media"
            size="mini"
            inverted
            position="top right"
          />
        </Input>

        <UploadModal
          modalOpen={modalOpen}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
          loading={uploadStatus}
        />
      </Segment>
    );
  }
}

export default MessagesForm;
