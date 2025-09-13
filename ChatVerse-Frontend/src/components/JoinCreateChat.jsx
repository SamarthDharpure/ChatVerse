import React, { useState } from "react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({ roomId: "", userName: "" });
  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(e) {
    setDetail({ ...detail, [e.target.name]: e.target.value });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Please fill all fields!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("Joined room 🎉");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (err) {
        toast.error(err?.response?.data || "Error joining room");
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const res = await createRoomApi(detail.roomId);
        toast.success("Room created 🚀");
        setCurrentUser(detail.userName);
        setRoomId(res.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (err) {
        toast.error(err?.response?.data || "Error creating room");
      }
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0c]">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-black to-purple-800 animate-gradientOpacity">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] mix-blend-overlay opacity-20"></div>
      </div>

      {/* Glow orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse"></div>

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-white/10 border border-gray-700 rounded-2xl shadow-2xl p-8 backdrop-blur-lg transition duration-300 hover:shadow-indigo-500/20 hover:border-indigo-400">
        {/* Logo + App Title */}
        <div className="text-center mb-8">
          <img
            src={chatIcon}
            alt="Chat Icon"
            className="w-20 h-20 mx-auto mb-4 opacity-90 drop-shadow-lg"
          />
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-800 bg-clip-text text-transparent drop-shadow-md">
            ChatVerse
          </h1>
          <p className="text-gray-300 mt-2 text-sm italic">
            Chat. Connect. Belong.
          </p>
        </div>

        {/* Section Title */}
        <h2 className="text-3xl font-bold text-center mb-6 tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500  to-pink-600 bg-clip-text text-transparent drop-shadow-md">
          Join or Create a New Room
        </h2>

        {/* Input: Name */}
        <div className="mb-5">
          <label className="block text-sm text-gray-300 mb-2">Your Name</label>
          <input
            name="userName"
            value={detail.userName}
            onChange={handleFormInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#121214] text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200"
            placeholder="e.g. Samarth"
          />
        </div>

        {/* Input: Room ID */}
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-2">Room ID / New Room ID</label>
          <input
            name="roomId"
            value={detail.roomId}
            onChange={handleFormInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#121214] text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition-all duration-200"
            placeholder="Enter or create a room ID"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={joinChat}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition transform hover:scale-[1.03] hover:shadow-indigo-400/40"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-pink-500/30 transition transform hover:scale-[1.03] hover:shadow-pink-400/40"
          >
            Create Room
          </button>
        </div>
      </div>

      {/* Credit Section */}
      <div className="absolute bottom-4 right-4 text-l text-gray-300 italic">
        Built with ❤️ by <span className="text-pink-300 font-semibold">Samarth Dharpure</span>
      </div>
    </div>
  );
};

export default JoinCreateChat;
