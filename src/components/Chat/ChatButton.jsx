import React, { useState, useEffect } from 'react';
import { FaComment, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWidget from './ChatWidget';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useChat();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isOpen ? <FaTimes size={24} /> : <FaComment size={24} />}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <ChatWidget onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatButton;