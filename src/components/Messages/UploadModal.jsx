import React, { Component } from "react";
import { Modal, Header, Input, Button, Icon } from "semantic-ui-react";

class UploadModal extends Component {
  state = {
    file: null,
    fileType: ["image/jpeg", "image/png"],
  };

  handleFile = (e) => {
    const file = e.target.files[0];
    console.log(file.type);
    if (file) {
      this.setState({ file: file });
    }
  };

  sendFile = () => {
    const { file } = this.state;
    const { uploadFile } = this.props;

    if (file !== null) {
      if (this.state.fileType.includes(file.type)) {
        const metadata = { contentType: file.type };
        uploadFile(file, metadata);
        //closeModal();
        this.setState({ file: null });
      }
    }
  };

  render() {
    const { modalOpen, closeModal, loading } = this.props;
    return (
      <Modal open={modalOpen} onClose={closeModal} basic size="small">
        <Header icon="file image" content="Upload an image" inverted />
        <Modal.Content>
          <Input
            fluid
            label="File types: .jpg, .png"
            name="file"
            type="file"
            inverted
            onChange={this.handleFile}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" /> Cancel
          </Button>
          <Button
            color="green"
            inverted
            onClick={this.sendFile}
            loading={loading}
            disabled={loading}
          >
            <Icon name="upload" /> Upload
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default UploadModal;
