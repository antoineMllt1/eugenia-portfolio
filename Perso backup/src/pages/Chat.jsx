import React, { useState } from 'react';
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react';

const Chat = () => {
    const [activeChat, setActiveChat] = useState(1);
    const [messageInput, setMessageInput] = useState('');

    const contacts = [
        { id: 1, name: "Alice M.", lastMessage: "Hey, did you finish the assignment?", time: "10:30 AM", unread: 2, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" },
        { id: 2, name: "Bob D.", lastMessage: "Meeting at Station F tomorrow?", time: "Yesterday", unread: 0, avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100" },
        { id: 3, name: "Charlie T.", lastMessage: "Thanks for the help!", time: "Mon", unread: 0, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" },
    ];

    const [messages, setMessages] = useState([
        { id: 1, sender: 'them', text: "Hey! How's the project coming along?", time: "10:00 AM" },
        { id: 2, sender: 'me', text: "Pretty good! Just finishing up the UI.", time: "10:05 AM" },
        { id: 3, sender: 'them', text: "Awesome, can't wait to see it.", time: "10:06 AM" },
        { id: 4, sender: 'them', text: "Hey, did you finish the assignment?", time: "10:30 AM" },
    ]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        setMessages([...messages, {
            id: Date.now(),
            sender: 'me',
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setMessageInput('');
    };

    return (
        <div className="h-[calc(100vh-4rem)] bg-eugenia-grey flex">
            {/* Sidebar */}
            <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-eugenia-red/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {contacts.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => setActiveChat(contact.id)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${activeChat === contact.id ? 'bg-eugenia-red/5 border-l-4 border-eugenia-red' : ''}`}
                        >
                            <div className="relative">
                                <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                                {contact.id === 1 && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-sm truncate">{contact.name}</h3>
                                    <span className="text-xs text-gray-500">{contact.time}</span>
                                </div>
                                <p className={`text-sm truncate ${contact.unread > 0 ? 'font-bold text-eugenia-dark' : 'text-gray-500'}`}>
                                    {contact.lastMessage}
                                </p>
                            </div>
                            {contact.unread > 0 && (
                                <div className="w-5 h-5 bg-eugenia-red text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {contact.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="hidden md:flex flex-1 flex-col bg-gray-50">
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={contacts[0].avatar} alt="Alice" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <h3 className="font-bold">Alice M.</h3>
                            <span className="text-xs text-green-500 font-medium">Online</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500">
                        <Phone size={20} className="cursor-pointer hover:text-eugenia-red" />
                        <Video size={20} className="cursor-pointer hover:text-eugenia-red" />
                        <MoreVertical size={20} className="cursor-pointer hover:text-eugenia-red" />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${msg.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div
                                    className={`p-3 rounded-2xl text-sm ${msg.sender === 'me'
                                            ? 'bg-eugenia-red text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                <span className="text-xs text-gray-400 mt-1 px-1">{msg.time}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-eugenia-red/50"
                        />
                        <button
                            type="submit"
                            className="p-3 bg-eugenia-red text-white rounded-full hover:bg-eugenia-red-dark transition-colors transform hover:scale-105"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
