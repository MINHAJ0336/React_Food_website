import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import ChatList from './ChatList';
import ChatMessages from './ChatMessages';

const ChatWidget = ({ onClose }) => {
  const { user } = useAuth();
  const { activeChat, setActiveChat } = useChat();
  const [showChatList, setShowChatList] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .neq('id', user.id)
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showChatList) {
      fetchUsers();
    }
  }, [showChatList]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setShowChatList(false);
  };

  const handleBack = () => {
    setActiveChat(null);
    setShowChatList(true);
  };

  const handleCloseWidget = () => {
    setActiveChat(null);
    setShowChatList(true);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed  top-10 bottom-24  right-6 z-50 w-96 h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r  from-primary to-secondary p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">
              {activeChat ? 'Chat' : 'Messages'}
            </h3>
            <p className="text-sm opacity-90">
              {activeChat ? (
                activeChat.user1_name || activeChat.user2_name
              ) : (
                'Chat with restaurant owners'
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {activeChat && (
              <button 
                onClick={handleBack}
                className="text-white hover:opacity-80 flex items-center gap-1"
              >
                <FaArrowLeft size={16} /> Back
              </button>
            )}
            {/* Close button for entire widget */}
            <button 
              onClick={handleCloseWidget}
              className="text-white hover:opacity-80 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!activeChat ? (
          <ChatList 
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
            onSelectChat={handleSelectChat}
            onClose={handleCloseWidget}  // Pass close function
          />
        ) : (
          <ChatMessages onBack={handleBack} />
        )}
      </div>
    </motion.div>
  );
};

export default ChatWidget;