import React, { Component } from "react";
import { Segment, Header, Accordion, Icon, Image } from "semantic-ui-react";

class MetaPanel extends Component {
  state = {
    activeIndex: 0,
    isPrivateChannel: this.props.isPrivateChannel,
    channel: this.props.currentChannel,
  };

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  render() {
    const { activeIndex, isPrivateChannel, channel } = this.state;

    if (isPrivateChannel || !channel) {
      return null;
    }

    return (
      <Segment>
        <Header as="h3" attached="top">
          About # {channel.name}
        </Header>
        <Accordion fluid styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.handleClick}
          >
            <Icon name="dropdown" />
            <Icon name="info circle" />
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            <p>{channel.description}</p>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={this.handleClick}
          >
            <Icon name="dropdown" />
            <Icon name="user circle outline" />
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <p>
              <Image src={channel.createdBy.avatar} avatar />
              {channel.createdBy.username}
            </p>
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

export default MetaPanel;
