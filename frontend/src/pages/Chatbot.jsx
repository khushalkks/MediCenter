import React, { useState, useEffect, useRef, useContext } from "react";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am Wellora's Medical Assistant. How can I help you today? You can ask me about symptoms, general health, or get guidance on finding doctors and booking appointments.",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { backendUrl } = useContext(AppContext);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    setMessages((prev) => [...prev, { text: userMessageText, sender: "user", timestamp }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${backendUrl || 'http://localhost:4000'}/api/chatbot`, {
        message: userMessageText
      });

      const botReply = response.data?.reply || "Sorry, I couldn't understand that.";
      setMessages((prev) => [
        ...prev,
        {
          text: botReply,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm having trouble connecting to the server. Please check your internet connection or try again later.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50 font-sans">
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="text-white p-4 rounded-full shadow-2xl flex items-center justify-center focus:outline-none transition-colors duration-200"
        style={{ backgroundColor: '#5f6FFF' }}
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mt-3 w-80 sm:w-96 h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between text-white" style={{ backgroundColor: '#5f6FFF' }}>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <FaRobot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Wellora Assistant</h3>
                  <p className="text-[11px] text-white/80">Online | Medical Chatbot</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-primary text-white rounded-tr-none"
                        : msg.isError
                        ? "bg-red-50 text-red-600 border border-red-100 rounded-tl-none"
                        : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none"
                    }`}
                    style={msg.sender === "user" ? { backgroundColor: '#5f6FFF' } : {}}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex flex-col max-w-[80%] self-start items-start">
                  <div className="px-4 py-3 bg-white text-gray-800 border border-gray-100 shadow-sm rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your medical query..."
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-full text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none flex items-center justify-center"
                style={{ backgroundColor: '#5f6FFF' }}
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
