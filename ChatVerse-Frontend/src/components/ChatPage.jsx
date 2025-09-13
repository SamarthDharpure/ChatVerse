import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  // Load old messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessagess(roomId);
        setMessages(messages);
      } catch (error) {}
    }
    if (connected) {
      loadMessages();
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }
  }, [roomId]);

  // Send message
  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }
  };

  function handleLogout() {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0a0c] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-black to-purple-800 animate-gradientOpacity">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] mix-blend-overlay opacity-20"></div>
      </div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse"></div>

     {/* Header */}
      <header className="relative z-10 w-full py-5 px-6 flex justify-between items-center bg-white/10 border-b border-gray-700 backdrop-blur-lg shadow-lg">
        <h1 className="px-4 py-2 rounded-full bg-pink-600/80 text-white font-semibold shadow-md hover:bg-indigo-700/80 transition">
          Room: <span className="text-white">{roomId}</span>
        </h1>
        <h1 className="px-4 py-2 rounded-full bg-indigo-600/80 text-white font-semibold shadow-md hover:bg-pink-700/80 transition">
          User: <span className="text-white">{currentUser}</span>
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-full bg-red-600/80 text-white font-semibold shadow-md hover:bg-red-700/80 transition"
        >
          Leave Room
        </button>
      </header>

      {/* Chat Area */}
      <main
        ref={chatBoxRef}
        className="relative z-10 flex-1 overflow-y-auto px-6 py-8 w-full max-w-4xl mx-auto"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex mb-4 ${
              message.sender === currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start gap-3 px-4 py-3 rounded-2xl max-w-md shadow-lg backdrop-blur-md ${
                message.sender === currentUser
                  ? "bg-gradient-to-r from-green-500/40 to-green-700/40 text-white"
                  : "bg-white/10 text-gray-200 border border-gray-700"
              }`}
            >
              <img
                className="h-10 w-10 rounded-full border border-gray-600"
                src={"https://avatar.iran.liara.run/public/43"}
                alt="avatar"
              />
              <div>
                <p className="text-sm font-bold text-indigo-300">
                  {message.sender}
                </p>
                <p className="text-base">{message.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {timeAgo(message.timeStamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Input Section */}
      <div className="relative z-10 w-full py-4 bg-transparent">
        <div className="flex items-center gap-3 max-w-3xl mx-auto px-4 py-3 rounded-full bg-white/10 border border-gray-700 backdrop-blur-lg shadow-lg">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-2"
          />
          <button className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition shadow-md">
            <MdAttachFile size={20} className="text-white" />
          </button>
          <button
            onClick={sendMessage}
            className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition shadow-md"
          >
            <MdSend size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Credit Section */}
      <div className="absolute bottom-4 right-4 text-sm text-gray-300 italic">
        Built with ❤️ by <span className="text-pink-300 font-semibold">Samarth Dharpure</span>
      </div>
    </div>
  );
};

export default ChatPage;
