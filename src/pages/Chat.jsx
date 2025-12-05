import ChatList from "../components/ChatList";

const Chat = () => {
  return (
    <div className="flex w-full h-[100vh] bg-[#111827] text-white">
      {/* LEFT SIDE CHAT LIST */}
      <div className="w-[30%] border-r border-gray-700">
        <ChatList />
      </div>

      {/* RIGHT SIDE EMPTY CHAT */}
      <div className="w-[70%] flex justify-center items-center text-gray-400">
        <p>Please select a contact</p>
      </div>
    </div>
  );
};

export default Chat;
