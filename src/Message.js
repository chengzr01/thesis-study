import React from "react";

const Message = ({ text, sender }) => {
  return (
    <div className={`message ${sender}`}>
      <b>{sender.toUpperCase()}</b>: {text}
    </div>
  );
};

export default Message;
