import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchUsers, fetchMoreUsers } from "../store/slices/usersSlice";
import ChatListItem from "./ChatListItem";
import SkeletonLoader from "./skeletons/Skeleton";
import { Input } from "./ui/input";

const ChatList = ({ onSelectDriver, selectedDriver, chatApi }) => {
  const dispatch = useAppDispatch();
  const { users, loading, loadingMore, lastFetched, hasMore, page, limit, lastSearch } = useAppSelector(
    (state) => state.users
  );
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const observerTarget = useRef(null);
  const hasInitiallyFetched = useRef(false);

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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Initial fetch on mount
  useEffect(() => {
    if (!hasInitiallyFetched.current && !loading) {
      hasInitiallyFetched.current = true;
      dispatch(fetchUsers({ page: 1, limit }));
    }
  }, [dispatch, limit, loading]);

  // Refetch when search changes
  useEffect(() => {
    // Only refetch if search actually changed (using strict comparison)
    const searchValue = searchDebounced.trim() || undefined;
    const lastSearchValue = lastSearch !== undefined ? lastSearch : undefined;
    
    if (searchValue !== lastSearchValue && !loading && hasInitiallyFetched.current) {
      dispatch(fetchUsers({ page: 1, limit, search: searchValue }));
    }
  }, [dispatch, limit, searchDebounced, lastSearch, loading]);

  // Infinite scroll observer - prevent duplicate calls
  const isLoadingRef = useRef(false);
  
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading && !isLoadingRef.current) {
      isLoadingRef.current = true;
      const nextPage = page + 1;
      const searchValue = searchDebounced.trim() || undefined;
      dispatch(fetchMoreUsers({ page: nextPage, limit, search: searchValue })).finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [dispatch, hasMore, loadingMore, loading, page, limit, searchDebounced]);

  useEffect(() => {
    // Only set up observer if we have more to load and not currently loading
    if (!hasMore || loadingMore || loading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Trigger 50px before the element is visible
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [handleLoadMore, hasMore, loadingMore, loading]);

  // Transform users from Redux to drivers format
  const drivers = useMemo(() => {
    if (!users?.length) return [];

    const withLastChat = users
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

    return driversWithIds;
  }, [users]);

  // No client-side filtering - API handles search
  const filtered = drivers;
  const selectedDriverId = getDriverId(selectedDriver);

  return (
    <div className="h-full flex flex-col">
      {/* 🔍 SEARCH BAR (STICKY) */}
      <div className="p-5 border-b border-gray-700 sticky top-0 bg-[#0d1117] z-20">
        <Input
          type="text"
          placeholder="Search drivers..."
          className="w-full bg-[#1f2937]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📜 DRIVER LIST (ONLY THIS SCROLLS) */}
      <div className="flex-1 overflow-y-auto chat-list-scroll">
        {/* Initial loading skeleton - only show on first load */}
        {loading && users.length === 0 && <SkeletonLoader count={10} />}

        {/* Show list items - even when loading more */}
        {!loading && filtered.length > 0 && (
          <>
            {filtered.map((driver) => (
              <ChatListItem
                key={driver.userid}
                driver={driver}
                isSelected={selectedDriverId === driver.userid}
                onClick={() => onSelectDriver(driver)}
              />
            ))}
          </>
        )}

        {/* Show existing items while loading more */}
        {loading && users.length > 0 && (
          <>
            {filtered.map((driver) => (
              <ChatListItem
                key={driver.userid}
                driver={driver}
                isSelected={selectedDriverId === driver.userid}
                onClick={() => onSelectDriver(driver)}
              />
            ))}
          </>
        )}

        {/* Infinite scroll trigger - only show when hasMore */}
        {hasMore && !loading && (
          <div 
            ref={observerTarget} 
            className="h-16 flex items-center justify-center py-2"
          >
            {loadingMore ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-600 border-t-[#1f6feb] rounded-full animate-spin"></div>
                <p className="text-gray-500 text-xs">Loading more...</p>
              </div>
            ) : (
              <p className="text-gray-500 text-xs">Scroll for more...</p>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && users.length === 0 && filtered.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-4">
            No drivers found
          </p>
        )}

        {/* No more to load */}
        {!hasMore && !loading && !loadingMore && filtered.length > 0 && (
          <p className="text-center text-gray-500 text-xs mt-2 py-2">
            All drivers loaded
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
