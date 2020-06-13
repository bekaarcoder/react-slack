import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import AvatarEditor from "react-avatar-editor";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Button,
  Input,
} from "semantic-ui-react";
import firebase from "../../firebase";

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    isLoaded: false,
    modal: false,
    previewImage: "",
    croppedImage: "",
    blob: "",
    storageRef: firebase.storage().ref(),
    currentUserRef: firebase.auth().currentUser,
    usersRef: firebase.firestore().collection("users"),
    avatarUrl: "",
    metadata: {
      contentType: "image/jpeg",
    },
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

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  cropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob((blob) => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob: blob,
        });
      });
    }
  };

  uploadImage = () => {
    const { storageRef, currentUserRef, blob, metadata } = this.state;
    storageRef
      .child(`avatars/user-${currentUserRef.uid}`)
      .put(blob, metadata)
      .then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadUrl) => {
          this.setState({ avatarUrl: downloadUrl }, () => this.changeAvatar());
        });
      });
  };

  changeAvatar = () => {
    const { currentUserRef, usersRef, avatarUrl } = this.state;
    currentUserRef
      .updateProfile({
        photoURL: avatarUrl,
      })
      .then(() => {
        console.log("Avatar Updated!");
        usersRef
          .doc(currentUserRef.uid)
          .update({
            avatar: avatarUrl,
          })
          .then(() => {
            this.closeModal();
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const { user, isLoaded, modal, previewImage, croppedImage } = this.state;
    console.log(croppedImage);
    return (
      isLoaded && (
        <Fragment>
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
                      <Dropdown.Item
                        text="Change Avatar"
                        onClick={this.openModal}
                      />
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

          <Modal open={modal} onClose={this.closeModal} basic size="small">
            <Header icon="file image" content="Change Your Avatar" inverted />
            <Modal.Content>
              <Input
                fluid
                label="File types: .jpg, .png"
                name="file"
                type="file"
                inverted
                onChange={this.handleFile}
              />
              <Grid centered stackable columns={2} style={{ marginTop: "5px" }}>
                <Grid.Row centered>
                  <Grid.Column className="ui centered align grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={(node) => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        style={{ margin: "3.5em auto" }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
              <Button color="blue" inverted onClick={this.cropImage}>
                <Icon name="image" /> Preview
              </Button>
              {croppedImage && (
                <Button color="green" inverted onClick={this.uploadImage}>
                  <Icon name="save" /> Change Avatar
                </Button>
              )}
            </Modal.Actions>
          </Modal>
        </Fragment>
      )
    );
  }
}

const maspStateToProps = (state) => ({
  user: state.user.currentUser,
});

export default connect(maspStateToProps, {})(UserPanel);
