import React, { useContext, useEffect, useRef, useState } from 'react';
import { AccountContext } from '../context/AccountProvider';
import { apiRequest } from '../requestMethods';
import { ACTIONS } from '../socket/actions';
import { IoSend } from "react-icons/io5";
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const Chat = ({ socketRef }) => {

  const { currentChat, setUpdateContactFlag } = useContext(AccountContext);
  const [selectedChat, setSelectedChat] = useState({});
  const [chatStatus, setChatStatus] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messageFlag, setMessageFlag] = useState(false);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.NEW_MESSAGE_RECEIVED, (data) => {
        if (data !== null) {
          setMessages(prev => [...prev, data])
        }
      });

      socketRef.current.on(ACTIONS.CHAT_CLOSE_REQUEST_ACCEPTED, (chatSession) => {
        if(currentChat === chatSession._id) {
          setChatStatus(chatSession.status)
        }
      })
    }

    return () => {
      socketRef.current.off(ACTIONS.NEW_MESSAGE_RECEIVED);
      socketRef.current.off(ACTIONS.CHAT_CLOSE_REQUEST_ACCEPTED);
    };
  }, [socketRef.current]);

  useEffect(() => {
    scrollRef.current &&
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
  });
  }, [messages]);

  useEffect(() => {
    const fetchCurrentChatData = async () => {
      if(currentChat) {
        try {
          const { data } = await apiRequest.get(`/chat/${currentChat}`);
          setSelectedChat(data.data)
          setChatStatus(data?.data?.status)
        } catch (error) {
          console.log(error)
        }
      }
    }
    fetchCurrentChatData();
  }, [currentChat])

  useEffect(() => {
    const fetchAllMessages = async () => {
      if(selectedChat._id) {
        const { data } = await apiRequest.get(`/message?chatId=${selectedChat._id}`);
        setMessages(data.data)
      }
    };
    fetchAllMessages();
  }, [selectedChat._id, messageFlag])

  // Handle sending a new message
  const sendMessage = async (e) => {
    if(!currentChat) return console.log("first select a person to continue chat")
    if (newMessage.trim()) {
      const code = e.keyCode || e.which;
      const type = e.type;
      if (code === 13 || type === "click") {
        const messageObj = {
          chatId: currentChat,
          sender: 'Agent',
          message: newMessage
        }
        try {
          await apiRequest.post('/message', messageObj)
          await apiRequest.put(`/chat/${currentChat}`, {lastMessage: newMessage})
        } catch (error) {
          console.log(error)
        }
        setNewMessage('');
        setMessageFlag(prev => !prev)
        setUpdateContactFlag(prev => !prev)
      }
    }
  };

  const sendCloseRequest = () => {
    socketRef.current.emit(ACTIONS.SEND_CHAT_CLOSE_REQUEST, { chatSessionId: currentChat });
    toast.success('Close request sent successfully!')
  }
  if(!currentChat) {
    return <div  className="flex flex-col items-center justify-center h-full bg-gray-900 text-white scrollbar-thin scrollbar-thumb-rounded">
      <p className='text-xl'>Select a chat to continue...</p>
    </div>
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white scrollbar-thin scrollbar-thumb-rounded">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <img
            src='https://via.placeholder.com/50'
            alt={selectedChat.customerName}
            className="w-12 h-12 rounded-full mr-3"
          />
          <div>
            <p className="font-bold">{selectedChat.customerName}</p>
            <p className="text-sm text-gray-400">{selectedChat.customerContact}</p>
          </div>
        </div>

        {/* Chat Status and Change Button */}
        <div className="flex items-center">
          <p className={`text-sm mr-2 px-3 py-1 rounded ${chatStatus === 'Active' ? 'bg-blue-500' : 'bg-red-500'}`}>{chatStatus}</p>
          {chatStatus === 'Active' && <button
            onClick={sendCloseRequest}
            className="bg-red-500 px-3 py-1 rounded text-sm"
          >
            Send Close Request
          </button>}
        </div>
      </div>

      {/* Messages Section */}
      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto">
        <p className="text-center text-xs text-gray-500 mb-4">Today</p>
        {messages.map((message) => (
          <div
            key={message?._id}
            className={`mb-4 flex ${message?.sender === 'Agent' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`px-3 py-1 rounded-lg ${message?.sender === 'Agent' ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <p className="text-sm">{message?.message}</p>
              <p className="text-xs text-gray-400 mt-0">{format(message?.createdAt, 'yyyy-MM-dd HH:mm')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input and Send Button */}
      { (chatStatus && chatStatus !== 'Closed') && 
        <div className="p-4 bg-gray-800 border-t border-gray-700 flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => sendMessage(e)}
            placeholder="Type a message..."
            className="flex-grow p-2 rounded bg-gray-700 placeholder-gray-400 focus:outline-none text-white"
          />
          <button
            onClick={(e) => sendMessage(e)}
            className="ml-2 bg-blue-500 px-4 py-2 rounded text-sm"
          >
            <IoSend size={24} />
          </button>
        </div>
      }
    </div>
  );
};

export default Chat;
