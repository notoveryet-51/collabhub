import React, { useState } from "react";
import "./chatbot.css";

const Chatbot = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <div
        className="chatbot-fab"
        onClick={() => setOpen(!open)}
        title="Chat with us"
      >
        💬
      </div>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>CollabHub Assistant</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatbot-body">
            <p className="bot-msg">Hi 👋 How can I help you?</p>
          </div>

          <div className="chatbot-footer">
            <input type="text" placeholder="Type your message..." />
            <button>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
