import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaUser } from 'react-icons/fa';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const ChatMessages = ({ onBack }) => {
  const { user } = useAuth();
  const { activeChat, messages, sendMessage, loading } = useChat();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getOtherUserName = () => {
    if (activeChat?.user1_id === user?.id) {
      return activeChat.user2_name;
    }
    return activeChat.user1_name;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    const success = await sendMessage(messageText);
    if (success) {
      setMessageText('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="spinner-small"></div>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <FaUser className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400">Say hello to {getOtherUserName()}</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender_id === user?.id;
                
                return (
                  <div
                    key={msg.id || index}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isMe ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-white text-gray-800'} rounded-2xl px-4 py-2 shadow-sm`}>
                      <p className="text-sm break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="bg-primary text-white p-2 rounded-full hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10 flex items-center justify-center"
          >
            <FaPaperPlane size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatMessages;