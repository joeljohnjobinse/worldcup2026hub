// src/components/auction/ChatBox.jsx
import { useState, useEffect, useRef } from "react";
import { subscribeToChat, sendChatMessage } from "../../firebase/auctionHelpers";

export default function ChatBox({ roomId, uid, name, color }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Subscribe to chat messages
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToChat(roomId, setMessages);
    return () => unsub();
  }, [roomId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendChatMessage(roomId, uid, name, input, color);
      setInput("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Chat send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Format timestamp from Firestore
  const formatTime = (ts) => {
    if (!ts?.seconds) return "";
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Group consecutive messages from the same user
  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1];
    const isFirst = !prev || prev.uid !== msg.uid;
    acc.push({ ...msg, isFirst });
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <span className="text-base">💬</span>
        <span className="font-black text-sm text-gray-300">Room Chat</span>
        <span className="ml-auto text-xs text-gray-600">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-8">
            No messages yet. Say something! 👋
          </div>
        )}

        {grouped.map((msg) => {
          const isMe = msg.uid === uid;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${
                msg.isFirst ? "mt-3" : "mt-0.5"
              }`}
            >
              {/* Name + time — only on first in a group */}
              {msg.isFirst && (
                <div className={`flex items-center gap-1.5 mb-0.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                  <span
                    className="text-xs font-bold"
                    style={{ color: msg.color || "#52A0E0" }}
                  >
                    {isMe ? "You" : msg.name}
                  </span>
                  <span className="text-gray-600 text-xs">{formatTime(msg.createdAt)}</span>
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-snug break-words ${
                  isMe
                    ? "bg-emerald-600/30 border border-emerald-500/30 text-white rounded-tr-sm"
                    : "bg-white/10 border border-white/10 text-gray-200 rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-3 py-3 border-t border-white/10 flex-shrink-0"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          maxLength={200}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-9 h-9 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.5}>
            <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
}