import { useParams } from "react-router-dom";
import { useState } from "react";

export default function ChatPage() {
  const { id } = useParams(); // user ID passed in URL
  const [messages, setMessages] = useState([
    { from: "admin", text: "Hello! I am connecting in response to complaint U0193" },
    { from: id, text: "Thank you, I had an issue with the rider..." },
  ]);
  const [newMsg, setNewMsg] = useState("");

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    setMessages((prev) => [...prev, { from: "admin", text: newMsg }]);
    setNewMsg("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#111] text-white">
      {/* Header */}
      <div className="p-4 bg-[#1F1F1F] text-xl font-semibold">
        Chat with <span className="text-primary">{id}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[70%] px-4 py-2 rounded ${
              msg.from === "admin"
                ? "bg-primary text-black self-end ml-auto"
                : "bg-gray-800 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 flex gap-2 border-t border-gray-700">
        <input
          className="flex-1 p-2 rounded bg-gray-800"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-primary text-black px-4 rounded font-medium"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}