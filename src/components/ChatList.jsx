import { useEffect, useState } from "react";
import ChatListItem from "./ChatListItem";
import {
  fetchUsersForChat as defaultFetchUsersForChat,
} from "../services/chatAPI";
import SkeletonLoader from "./skeletons/Skeleton";

const ChatList = ({ onSelectDriver, selectedDriver, chatApi }) => {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchUsersForChat } = chatApi || {
    fetchUsersForChat: defaultFetchUsersForChat,
  };

  function getDriverId(driver) {
    const candidate =
      driver?.userid ??
      driver?.userId ??
      driver?.contactId ??
      driver?.contactid ??
      driver?.uid ??
      driver?.id ??
      null;

    if (candidate === "" || candidate === null || candidate === undefined) {
      return null;
    }

    return candidate;
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers() {
    try {
      setLoading(true);

      const res = await fetchUsersForChat();

      if (!res?.users?.length) {
        setDrivers([]);
        return;
      }

      const withLastChat = res.users
        .map((u) => {
          const userId = getDriverId(u);
          if (!userId) {
            return null;
          }

          return {
            userid: userId,
            driver_name: u.name || u.driver_name,
            driver_image: u.profilePic || u.image || null,
            lastSeen: u.lastSeen || null,
            last_message: u.last_message || "",
            last_chat_time: u.last_chat_time || null,
          };
        })
        .filter(Boolean);

      // 🔥 SORT → latest chat first
      const driversWithIds = withLastChat.filter(Boolean);

      driversWithIds.sort((a, b) => {
        if (!a.last_chat_time) return 1;
        if (!b.last_chat_time) return -1;
        return (
          new Date(b.last_chat_time).getTime() -
          new Date(a.last_chat_time).getTime()
        );
      });

      setDrivers(driversWithIds);
    } finally {
      setLoading(false);
    }
  }

  const filtered = drivers.filter((d) =>
    d.driver_name?.toLowerCase().includes(search.toLowerCase())
  );
  const selectedDriverId = getDriverId(selectedDriver);

  return (
    <div className="h-full flex flex-col">
      {/* 🔍 SEARCH BAR (STICKY) */}
      <div className="p-5 border-b border-gray-700 sticky top-0 bg-[#0d1117] z-20">
        <input
          type="text"
          placeholder="Search drivers..."
          className="w-full p-2 bg-[#1f2937] rounded outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📜 DRIVER LIST (ONLY THIS SCROLLS) */}
      {/* <div className="flex-1 overflow-y-auto"> */}
      <div className="flex-1 overflow-y-auto chat-list-scroll">
        {/* {loading && (
          <p className="text-center text-gray-500 text-sm mt-4">
            Loading chats...
          </p>
        )} */}
        {loading && <SkeletonLoader count={10} />}

        {!loading &&
          filtered.map((driver) => (
            <ChatListItem
              key={driver.userid}
              driver={driver}
              isSelected={selectedDriverId === driver.userid}
              onClick={() => onSelectDriver(driver)}
            />
          ))}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-4">
            No drivers found
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
