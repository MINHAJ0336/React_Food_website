import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's chat rooms
  const fetchChatRooms = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChatRooms(data || []);
      
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  // Fetch unread messages count
  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Get or create chat room with a user
  const getOrCreateChatRoom = async (otherUserId, otherUserName) => {
    if (!user?.id || !otherUserId) return null;

    try {
      const { data: existing } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        setActiveChat(existing);
        await fetchMessages(existing.room_id);
        return existing;
      }

      const roomId = `${user.id}_${otherUserId}_${Date.now()}`;
      const newRoom = {
        room_id: roomId,
        user1_id: user.id,
        user2_id: otherUserId,
        user1_name: user.name,
        user2_name: otherUserName,
        last_message: '',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('chat_rooms')
        .insert([newRoom])
        .select()
        .single();

      if (error) throw error;

      setChatRooms([data, ...chatRooms]);
      setActiveChat(data);
      return data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast.error('Failed to start chat');
      return null;
    }
  };

  // Fetch messages for a chat room
  const fetchMessages = async (roomId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      await markMessagesAsRead(roomId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (roomId) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_room_id', roomId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send a message
  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !activeChat || !user?.id) return false;

    const otherUserId = activeChat.user1_id === user.id ? activeChat.user2_id : activeChat.user1_id;

    try {
      const newMessage = {
        chat_room_id: activeChat.room_id,
        sender_id: user.id,
        receiver_id: otherUserId,
        message: messageText.trim(),
        is_read: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([newMessage])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('chat_rooms')
        .update({
          last_message: messageText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('room_id', activeChat.room_id);

      setMessages([...messages, data]);
      
      setChatRooms(prev => {
        const updated = prev.map(room => 
          room.room_id === activeChat.room_id 
            ? { ...room, last_message: messageText.trim(), updated_at: new Date().toISOString() }
            : room
        );
        return updated.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    }
  };

  // Subscribe to real-time messages
  useEffect(() => {
    if (!activeChat?.room_id) return;

    const subscription = supabase
      .channel(`chat_${activeChat.room_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_room_id=eq.${activeChat.room_id}`
      }, (payload) => {
        const newMessage = payload.new;
        setMessages(prev => [...prev, newMessage]);
        
        setChatRooms(prev => prev.map(room =>
          room.room_id === activeChat.room_id
            ? { ...room, last_message: newMessage.message, updated_at: new Date().toISOString() }
            : room
        ));
        
        if (newMessage.receiver_id === user?.id) {
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', newMessage.id);
          fetchUnreadCount();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeChat?.room_id, user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchChatRooms();
    }
  }, [user?.id]);

  return (
    <ChatContext.Provider value={{
      chatRooms,
      unreadCount,
      activeChat,
      messages,
      loading,
      getOrCreateChatRoom,
      sendMessage,
      fetchMessages,
      setActiveChat,
      fetchChatRooms
    }}>
      {children}
    </ChatContext.Provider>
  );
};