import React, { useState } from "react";
import ReactDOM from "react-dom"; // 👈 Import this
import "./chatbot.css";

const Chatbot = () => {
  const [open, setOpen] = useState(false);

  // We wrap the whole thing in a Portal
  return ReactDOM.createPortal(
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
    </>,
    document.body // 👈 This tells React: "Render this directly in the <body> tag"
  );
};

export default Chatbot;