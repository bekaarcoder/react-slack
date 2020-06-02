import React from "react";
import { Comment, Icon, Image } from "semantic-ui-react";
import moment from "moment";

const Message = ({ channelMessage, currentUser }) => {
  const { user, timestamp } = channelMessage;
  return (
    <Comment>
      <Comment.Avatar
        src={user.avatar}
        className={currentUser.uid === user.id ? "floated right" : ""}
      />
      <Comment.Content
        className={currentUser.uid === user.id ? " floated right" : ""}
      >
        <Comment.Author as="a">
          {currentUser.uid === user.id ? "You" : user.displayName}
        </Comment.Author>
        <Comment.Metadata>
          <div>{timestamp && moment(timestamp.toDate()).fromNow()}</div>
        </Comment.Metadata>
        {channelMessage.hasOwnProperty("mediaURL") ? (
          <Image
            src={channelMessage.mediaURL}
            style={{ width: 150, padding: "1em 0em" }}
          />
        ) : (
          <Comment.Text>{channelMessage.message}</Comment.Text>
        )}

        <Comment.Actions>
          <Comment.Action>
            <Icon name="like" /> Like
          </Comment.Action>
        </Comment.Actions>
      </Comment.Content>
    </Comment>
  );
};

export default Message;
