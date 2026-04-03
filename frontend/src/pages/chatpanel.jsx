import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot } from "lucide-react";

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 I’m your AI Expense Buddy. What do you want to do?",
      options: ["Show Expense", "View Spending", "Check Balance"],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 SEND MESSAGE (API CONNECTED)
  const sendMessage = async (customMessage = null) => {
    const msgText = customMessage || input;
    if (!msgText.trim()) return;

    const userMsg = { sender: "user", text: msgText };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: msgText }),
      });

      const data = await res.json();

      const botMsg = {
        sender: "bot",
        text: data.reply || "⚠️ No response",
        type: data.type || "text",
        data: data.data || null,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!botMsg.data||botMsg.type=="list"){setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Hi 👋 I’m your AI Expense Buddy. What do you want to do?",
          options: ["Show Expense", "View Spending", "Check Balance"],
        },
      ]);}
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Error talking to server",
        },
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option) => {
    sendMessage(option);
  };

  return (
    <div className="flex h-full w-full bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col bg-white border-r min-w-[220px] max-w-[300px] w-[20%] resize-x overflow-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">FinChat</h2>
          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg">
            + New Chat
          </button>
          <div className="mt-6 text-gray-500 text-sm">
            Recent chats coming soon...
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b px-4 md:px-6 py-4 font-semibold">
          AI Expense Assistant
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"
                }`}
            >
              <div className="flex items-start gap-3">
                {msg.sender === "bot" && (
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl text-sm break-words ${msg.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white border"
                    }`}
                >
                  {msg.text}

                  {/* 🔥 LIST UI RENDER */}
                  {msg.type === "list" && msg.data && (
                    <div className="mt-3 space-y-2">
                      {msg.data.map((item, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 border rounded-xl p-3 text-xs"
                        >
                          <div className="flex justify-between font-medium">
                            <span>{item.category}</span>
                            <span className="text-indigo-600">
                              ₹{item.amount}
                            </span>
                          </div>

                          <div className="text-gray-400 mt-1">
                            {item.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.type === "options" && msg.data && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.data.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(opt)}
                          className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs hover:bg-indigo-200 transition"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="bg-gray-300 p-2 rounded-full">
                    <User className="w-4 h-4 text-gray-700" />
                  </div>
                )}
              </div>

              {/* Options */}
              {msg.options && (
                <div className="flex flex-wrap gap-2 mt-2 ml-10">
                  {msg.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionClick(opt)}
                      className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs hover:bg-indigo-200 transition"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Bot className="w-4 h-4" />
              Thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-gray-100 px-4 pb-4 pt-2">
          <div className="mx-auto max-w-3xl">
            <div className="bg-white shadow-lg border rounded-2xl flex items-center px-4 py-3 gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Or ask anything with AI..."
                className="flex-1 outline-none text-sm bg-transparent"
              />

              <button
                onClick={() => sendMessage()}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:opacity-90 disabled:opacity-50"
                disabled={loading}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}