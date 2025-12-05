const ChatUserCard = ({ data }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1f2937] cursor-pointer">
      <div className="flex gap-3">
        <img
          src={data.avatar}
          alt="user"
          className="w-12 h-12 rounded-xl object-cover"
        />

        <div>
          <p className="font-semibold">{data.name}</p>
          <p className="text-gray-400 text-sm">{data.lastMessage}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-gray-400 text-sm">{data.lastTime}</p>

        {data.unread > 0 && (
          <span className="bg-red-500 text-white rounded-full px-2 py-[2px] text-xs">
            {data.unread}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatUserCard;
