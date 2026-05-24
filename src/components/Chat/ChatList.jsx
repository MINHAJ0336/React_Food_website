import React from 'react';
import { FaSearch, FaUser, FaEnvelope, FaStore, FaTimes } from 'react-icons/fa';
import { useChat } from '../../context/ChatContext';

const ChatList = ({ users, searchTerm, setSearchTerm, loading, onSelectChat, onClose }) => {
  const { chatRooms, getOrCreateChatRoom } = useChat();

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = async (user) => {
    const chatRoom = await getOrCreateChatRoom(user.id, user.name);
    if (chatRoom) {
      onSelectChat(chatRoom);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Close Button */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">Start a New Chat</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition p-1 rounded-full hover:bg-gray-200"
            aria-label="Close chat"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="spinner-small"></div>
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <FaEnvelope className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users found</p>
                <p className="text-sm text-gray-400">Try a different search term</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition border-b text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {user.role === 'admin' ? (
                        <FaStore className="text-xs text-primary" />
                      ) : (
                        <FaUser className="text-xs text-gray-400" />
                      )}
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <FaEnvelope className="text-gray-400" />
                </button>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatList;