import React, { Component } from "react";
import { Segment, Header, Icon, Input } from "semantic-ui-react";

class MessagesHeader extends Component {
  render() {
    const {
      channel,
      uniqueUsers,
      handleSearch,
      privateChannel,
      handleStar,
      isChannelStarred,
    } = this.props;
    return (
      <Segment clearing>
        <Header as="h3" floated="left">
          {privateChannel ? (
            <Icon name="at" color="black" />
          ) : (
            <Icon name="hashtag" color="black" />
          )}

          <Header.Content>
            {channel && channel.name}
            {!privateChannel && (
              <Header.Subheader>
                {uniqueUsers} {uniqueUsers > 1 ? "Users" : "User"}
              </Header.Subheader>
            )}
          </Header.Content>
          {!privateChannel && (
            <Icon
              name={isChannelStarred ? "star" : "star outline"}
              color={isChannelStarred ? "yellow" : "black"}
              style={{ paddingLeft: 15 }}
              onClick={handleStar}
            />
          )}
        </Header>
        <Header floated="right">
          <Input
            icon="search"
            placeholder="Search Messages"
            size="mini"
            name="searchTerm"
            onChange={handleSearch}
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
