import React, { useState, useEffect } from "react";
import { FaRobot } from "react-icons/fa";
import { motion, useAnimation } from "framer-motion"; // Import Framer Motion

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();

  // Auto Motion Effect for Robot Icon
  useEffect(() => {
    const animateIcon = async () => {
      while (true) {
        await controls.start({ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] });
      }
    };
    animateIcon();
  }, [controls]);

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      const botMessage = { text: data.reply, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end">
      {/* Auto Moving Chatbot Icon */}
      <motion.div animate={controls}>
        <FaRobot
          size={40}
          className="text-blue-600 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />
      </motion.div>

      {/* Chatbox UI */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-12 right-0 w-80 bg-white border rounded-lg shadow-lg p-3 z-50"
        >
          <div className="h-60 overflow-y-auto">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-2 my-1 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`px-3 py-1 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.text}
                </span>
              </motion.div>
            ))}
          </div>
          {/* Input Field */}
          <div className="flex mt-2">
            <input
              className="flex-1 border p-2 rounded-l"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
            />
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded-r"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Chatbot;
