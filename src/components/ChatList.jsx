import { useEffect, useState } from "react";
import ChatUserCard from "./ChatUserCard";

const ChatList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch from Backend
  const fetchChats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/chats");
      const data = await res.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching chat list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Search Filter
  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="bg-[#1f2937] p-3 rounded-2xl flex items-center gap-3 mb-4">
        <span className="text-xl">🚚</span>
        <input
          type="text"
          placeholder="Search Drivers"
          className="bg-transparent outline-none w-full text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span>🔍</span>
      </div>

      {/* Loader */}
      {loading && (
        <p className="text-center text-gray-400 mt-6">Loading chats...</p>
      )}

      {/* Driver Cards */}
      {!loading && filteredDrivers.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No chats found</p>
      )}

      <div className="mt-2 space-y-3 overflow-y-auto h-[82vh] pr-1">
        {!loading &&
          filteredDrivers.map((d) => <ChatUserCard key={d.id} data={d} />)}
      </div>
    </div>
  );
};

export default ChatList;
