import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Sparkles } from "lucide-react";

const PREDEFINED_SUGGESTIONS = [
  "Add 500 for groceries today",
  "Show my spending this month",
  "Check my balance",
  "Delete my lunch expense yesterday",
  "Add 200 for transportation",
  "What is my total income?",
  "List all my transactions"
];

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
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [expenseData, setExpenseData] = useState({ amount: "", category: "", note: "", date: "" });
  const [suggestions, setSuggestions] = useState([]);

  const bottomRef = useRef(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    
    if (val.trim().length > 1) {
      const filtered = PREDEFINED_SUGGESTIONS.filter(
        (s) => s.toLowerCase().includes(val.toLowerCase()) && s.toLowerCase() !== val.toLowerCase()
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 SEND MESSAGE (API CONNECTED)
  const sendMessage = async (customMessage = null, isExpense = false) => {
    const msgText = customMessage || input;
    if (!msgText.trim() && !isExpense) return;

    if (isExpense && (!expenseData.amount || !expenseData.category)) return;

    const userMsg = {
      sender: "user",
      text: isExpense
        ? `Add ${expenseData.amount} for ${expenseData.category} ${expenseData.note ? `(${expenseData.note})` : ""} ${expenseData.date ? `on ${expenseData.date}` : ""}`.trim()
        : msgText,
    };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");
    setSuggestions([]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: isExpense
            ? `Add ${expenseData.amount} for ${expenseData.category} ${expenseData.note ? `(${expenseData.note})` : ""} ${expenseData.date ? `on ${expenseData.date}` : ""}`.trim()
            : msgText,
        }),
      });

      const data = await res.json();

      const botMsg = {
        sender: "bot",
        text: data.reply || "⚠️ No response",
        type: data.type || "text",
        data: data.data || null,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (!botMsg.data || botMsg.type === "list") {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Hi 👋 I’m your AI Expense Buddy. What do you want to do?",
            options: ["Show Expense", "View Spending", "Check Balance"],
          },
        ]);
      }
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
      if (isExpense) {
        setShowQuickAdd(false);
        setExpenseData({ amount: "", category: "", note: "", date: "" });
      }
    }
  };

  const handleOptionClick = (option) => {
    sendMessage(option);
  };

  const handleQuickAddSubmit = () => {
    sendMessage("", true);
  };

  const handleNewChat = () => {
    setMessages([
      {
        sender: "bot",
        text: "Hi 👋 I’m your AI Expense Buddy. What do you want to do?",
        options: ["Show Expense", "View Spending", "Check Balance"],
      },
    ]);
    setInput("");
    setShowQuickAdd(false);
    setSuggestions([]);
  };

  return (
    <div className="flex items-center justify-center h-full w-full bg-slate-50 p-2 md:p-6 font-sans">
      <div className="flex w-full max-w-5xl h-full md:h-[88vh] bg-white md:rounded-[2rem] shadow-sm md:shadow-2xl overflow-hidden border border-slate-200/60">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col bg-slate-50/50 border-r border-slate-100 min-w-[260px] w-[25%] p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-indigo-200 shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">FinChat</h2>
          </div>
          
          <button 
            onClick={handleNewChat}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            + New Chat
          </button>
          
          <div className="mt-10">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Recent Conversations</h4>
            <div className="text-slate-400 text-sm text-center p-6 bg-slate-100/50 rounded-2xl border border-dashed border-slate-200">
              Chats coming soon...
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="md:hidden bg-indigo-600 p-2 rounded-xl text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">AI Expense Assistant</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-xs font-semibold text-green-700">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-8 scroll-smooth will-change-scroll">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                } animate-in slide-in-from-bottom-2 fade-in duration-300`}
              >
                <div className={`flex items-end gap-3 max-w-[90%] md:max-w-[75%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {msg.sender === "bot" && (
                    <div className="hidden md:flex flex-shrink-0 bg-white border shadow-sm border-slate-200 p-2.5 rounded-full mb-1">
                      <Bot className="w-5 h-5 text-indigo-600" />
                    </div>
                  )}

                  <div
                    className={`px-6 py-4 text-[15px] leading-relaxed break-words whitespace-pre-wrap ${
                      msg.sender === "user" 
                        ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-[1.5rem] rounded-br-sm shadow-indigo-100 shadow-md" 
                        : "bg-white border border-slate-100 shadow-sm shadow-slate-100/50 text-slate-700 rounded-[1.5rem] rounded-bl-sm"
                    }`}
                  >
                    {msg.text}

                    {/* 🔥 LIST UI */}
                    {msg.type === "list" && msg.data && (
                      <div className="mt-5 space-y-3">
                        {msg.data.map((item, i) => (
                          <div key={i} className="bg-slate-50/80 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all rounded-2xl p-4 text-sm group">
                            <div className="flex justify-between items-center font-bold mb-1.5">
                              <span className="text-slate-700 capitalize">{item.category}</span>
                              <span className="text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">₹{item.amount}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              {item.description && <span className="text-slate-500 font-medium truncate max-w-[140px] block">{item.description}</span>}
                              <span className="text-slate-400 font-medium ml-auto">
                                {new Date(item.paymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.type === "options" && msg.data && (
                      <div className="flex flex-wrap gap-2.5 mt-5">
                        {msg.data.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleOptionClick(opt)}
                            className="px-5 py-2.5 bg-indigo-50/50 text-indigo-700 font-semibold rounded-full text-sm hover:bg-indigo-600 hover:text-white transition-all duration-200 border border-indigo-100"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Introductory Options */}
                {msg.options && (
                  <div className="flex flex-wrap gap-2.5 mt-4 md:ml-[3.25rem]">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(opt)}
                        className="px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-full text-sm hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-200 hover:border-transparent hover:shadow-md"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-3 text-slate-400 text-sm font-medium animate-pulse ml-2 md:ml-12">
                <Bot className="w-5 h-5" />
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></span>
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></span>
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></span>
                </div>
              </div>
            )}

            <div ref={bottomRef} className="h-4" />
          </div>

          {/* Quick Add Form */}
          {showQuickAdd && (
            <div className="bg-white border-t border-slate-100 p-4 md:px-8 md:py-6 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Quick Expense</h4>
                <button onClick={() => setShowQuickAdd(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider">Cancel</button>
              </div>
              <div className="flex gap-3 flex-wrap md:flex-nowrap">
                <input
                  type="number"
                  placeholder="₹ Amount"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-slate-200 flex-1 min-w-[100px] outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm font-medium"
                />
                <input
                  type="text"
                  placeholder="Category..."
                  value={expenseData.category}
                  onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-slate-200 flex-1 min-w-[120px] outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm font-medium"
                />
                <input
                  type="text"
                  placeholder="Note..."
                  value={expenseData.note}
                  onChange={(e) => setExpenseData({ ...expenseData, note: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-slate-200 flex-1 min-w-[100px] outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm font-medium"
                />
                <input
                  type="date"
                  value={expenseData.date}
                  onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-slate-200 flex-1 min-w-[125px] outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm font-medium text-slate-500"
                />
                <button
                  onClick={handleQuickAddSubmit}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm whitespace-nowrap"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Input Bar */}
          {!showQuickAdd && (
            <div className="bg-white/90 backdrop-blur-xl p-4 md:p-6 z-10 sticky bottom-0 relative">
              
              {/* SUGGESTIONS */}
              {suggestions.length > 0 && (
                <div className="absolute bottom-[calc(100%-10px)] left-4 md:left-6 mb-2 bg-white border border-indigo-100 shadow-xl shadow-indigo-100/50 rounded-2xl overflow-hidden py-2 animate-in slide-in-from-bottom-2 z-50 min-w-[280px]">
                   <div className="px-4 py-2 border-b border-slate-100 mb-1 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                     <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Suggestions
                   </div>
                   {suggestions.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setInput(s); setSuggestions([]); }}
                        className="w-full text-left px-5 py-2.5 hover:bg-indigo-50 text-[14px] font-medium text-slate-700 transition"
                      >
                         {s}
                      </button>
                   ))}
                </div>
              )}

              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-[1.5rem] px-2 py-2 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-300 transition-all">
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm hover:shadow border border-slate-100 mx-1 transition-all group shrink-0"
                  title="Quick Add"
                >
                  <span className="font-black text-lg leading-none group-hover:scale-110 block transform transition-transform">+</span>
                </button>
                <input
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about your spending..."
                  className="flex-1 outline-none text-[15px] font-medium bg-transparent px-4 py-2 text-slate-700 placeholder-slate-400"
                />
                <button
                  onClick={() => sendMessage()}
                  className="bg-indigo-600 text-white p-3.5 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none mx-1 shrink-0"
                  disabled={loading || (!input.trim())}
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
              <div className="text-center mt-3">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">Powered by Gemini AI</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}