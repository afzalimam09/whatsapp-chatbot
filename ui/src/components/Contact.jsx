import React, { useContext, useEffect, useState } from 'react';
import { AccountContext } from '../context/AccountProvider';
import { apiRequest } from '../requestMethods';
import { ACTIONS } from '../socket/actions';

const Contact = ({ socketRef }) => {
  const { account, setAccount, setCurrentChat, currentChat, updateContactFlag } = useContext(AccountContext);
  const [ loading, setLoading ] = useState(false)
  const [ filter, setFilter ] = useState('Active');
  const [ contactData, setContactData ] = useState([]);
  const [flag, setFlag] = useState(false)

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.UPDATE_CONTACT_LIST, (chatSessionId) => {
        console.log("update...", chatSessionId)
        if(chatSessionId !== null) {
          setFilter('Active')
          setFlag(prev => !prev)
          if(!currentChat || currentChat == chatSessionId) setCurrentChat(chatSessionId);
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.UPDATE_CONTACT_LIST);
    };
  }, [socketRef.current]);


  useEffect(() => {
    const getContacts = async () => {
      const endpoint = filter === 'All' ? `/chat` : `/chat?status=${filter}`;
      const { data } = await apiRequest.get(endpoint);
      setContactData(data.data)
    };
    getContacts();
  }, [filter, flag, updateContactFlag])

  const handleLogout = async() => {
    try {
      setLoading(true)
      await apiRequest.get('/auth/logout');
      setAccount(null)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 h-full flex flex-col bg-gray-800 text-white scrollbar-thin scrollbar-thumb-rounded">
      {/* Logged-in User Details */}
      <div className="flex items-center mb-4">
        <img
          src='https://via.placeholder.com/50'
          alt={account?.user?.fullName}
          className="w-12 h-12 rounded-full mr-3"
        />
        <div>
          <p className="font-bold">{account?.user?.fullName}</p>
          <p className="text-sm text-gray-400">{account?.user?.email}</p>
        </div>
        <button disabled={loading} onClick={handleLogout} className="ml-auto bg-red-500 px-3 py-1 rounded text-sm cursor-pointer">
          {loading ? 'Logging Out': 'Logout'}
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search contacts..."
        className="mb-4 p-2 rounded bg-gray-700 placeholder-gray-400 focus:outline-none"
      />

      {/* Filter Buttons */}
      <div className="mb-4 flex gap-3">
        <button
          onClick={() => setFilter('Active')}
          className={`px-3 py-1 rounded ${filter === 'Active' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('Closed')}
          className={`px-3 py-1 rounded ${filter === 'Closed' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          Closed
        </button>
        <button
          onClick={() => setFilter('All')}
          className={`px-3 py-1 rounded ${filter === 'All' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          All
        </button>
      </div>

      {/* Contact List */}
      {contactData.length > 0 ? <div className="overflow-y-auto flex-grow">
        {contactData?.map(contact => (
          <div key={contact._id} onClick={() => setCurrentChat(contact._id)} className={`flex items-center mb-3 p-2 hover:bg-gray-700 rounded cursor-pointer ${currentChat === contact._id ? 'bg-gray-700' : ''}`}>
            <img
              src="https://via.placeholder.com/50"
              alt={contact.customerName}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-grow">
              <p className="font-bold">{contact?.customerName}</p>
              <p className="text-sm text-gray-400">{contact?.customerContact}</p>
              {contact?.lastMessage && <p className="text-xs text-gray-500">{contact?.lastMessage?.substring(0, 35)} {contact?.lastMessage?.length > 35 && '...'}</p>}
            </div>
          </div>
        ))}
      </div> : <div className='mt-5 text-center'> <p>There are no {filter.toLowerCase()} chats at the moment. {filter === 'Active' && 'Please keep an eye on the request section, as new chat requests will come in, allowing you to continue chatting'}</p> </div>}
    </div>
  );
};

export default Contact;
