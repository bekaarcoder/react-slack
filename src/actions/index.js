import * as actionTypes from "./types";

// User Actions

export const setUser = (user) => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user,
    },
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER,
  };
};

// Channel Actions

export const setCurrentChannel = (channel) => {
  return {
    type: actionTypes.SET_CURRENT_CHANNEL,
    payload: {
      currentChannel: channel,
    },
  };
};

export const setPrivateChannel = (isPrivate) => {
  return {
    type: actionTypes.SET_PRIVATE_CHANNEL,
    payload: {
      isPrivate: isPrivate,
    },
  };
};

export const setActiveChannel = (channelId) => {
  return {
    type: actionTypes.SET_ACTIVE_CHANNEL,
    payload: {
      channelId: channelId,
    },
  };
};
