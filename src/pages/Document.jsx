import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchDocuments, fetchMoreDocuments, resetPagination } from "../store/slices/documentsSlice";
import DocumentPreviewContent from "../components/DocumentPreviewContent";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Checkbox } from "../components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../components/ui/drawer";
import { X } from "lucide-react";
import DocumentTableSkeleton from "../components/skeletons/DocumentTableSkeleton";

// Last 60 Days
function getDefaultDates() {
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 60);

  const format = (d) => d.toISOString().split("T")[0];

  return { start: format(past), end: format(today) };
}

const FILTER_MAP = {
  "Pickup Doc": "pick_up",
  "Delivery Proof": "delivery",
  "Load Image": "load_image",
  "Fuel Receipt": "fuel_recipt",
  "Stamp Paper": "paper_logs",
  "Driver Expense": "driver_expense_sheet",
  "DM Transport Trip Envelope": "dm_transport_trip_envelope",
  "DM Trans Inc Trip Envelope": "dm_trans_inc_trip_envelope",
  "DM Transport City Worksheet": "dm_transport_city_worksheet_trip_envelope",
  "Repair and Maintenance": "trip_envelope",
  "CTPAT": "CTPAT",
};

export default function Documents() {
  const { start, end } = getDefaultDates();
  const dispatch = useAppDispatch();
  const {
    documents: allDocuments,
    loading,
    loadingMore,
    hasMore,
    page,
    limit,
    total,
    totalDocuments,
    lastFetchParams,
    lastFetched,
  } = useAppSelector((state) => state.documents);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDocIds, setSelectedDocIds] = useState(new Set());
  const observerTarget = useRef(null);

  const [searchParams] = useSearchParams();

  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  const [selectedFilters, setSelectedFilters] = useState([]); // Array of filter values

  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  const [statusFilter, setStatusFilter] = useState("all"); // all | seen | unseen
  const [categoryFilter, setCategoryFilter] = useState(null); // C D F

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);


  // Convert status filter to isSeen parameter
  const isSeenParam = useMemo(() => {
    if (statusFilter === "seen") return true;
    if (statusFilter === "unseen") return false;
    return null;
  }, [statusFilter]);

  // Convert category filter to API format (C, D, F)
  // Note: The API expects category as a single value, not an array
  const categoryParam = useMemo(() => {
    return categoryFilter || null;
  }, [categoryFilter]);

  // Convert document type filters to API format
  // These are sent as multiple "type" parameters
  const typeFilters = useMemo(() => {
    return selectedFilters.length > 0 ? selectedFilters : [];
  }, [selectedFilters]);

  // Fetch documents when params change (initial load)
  useEffect(() => {
    const paramsChanged =
      !lastFetchParams ||
      lastFetchParams.startDate !== startDate ||
      lastFetchParams.endDate !== endDate ||
      lastFetchParams.search !== searchDebounced ||
      lastFetchParams.isSeen !== isSeenParam ||
      lastFetchParams.category !== categoryParam ||
      JSON.stringify(lastFetchParams.filters || []) !== JSON.stringify(typeFilters);

    const isStale = lastFetched && Date.now() - lastFetched > 5 * 60 * 1000;

    if ((paramsChanged || isStale) && !loading) {
      dispatch(resetPagination());
      dispatch(
        fetchDocuments({
          startDate,
          endDate,
          page: 1,
          limit: 20,
          search: searchDebounced,
          isSeen: isSeenParam,
          category: categoryParam,
          filters: typeFilters,
        })
      );
    }
  }, [
    dispatch,
    startDate,
    endDate,
    searchDebounced,
    isSeenParam,
    categoryParam,
    typeFilters,
    lastFetchParams,
    lastFetched,
    loading,
  ]);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    const statusParam = searchParams.get("status");

    // Handle single type from URL params (for backward compatibility)
    if (typeParam) {
      setSelectedFilters([typeParam]);
    }

    if (["all", "seen", "unseen"].includes(statusParam)) {
      setStatusFilter(statusParam);
    } else {
      setStatusFilter("all");
    }
  }, [searchParams]);

  // Toggle filter selection
  const toggleFilter = (filterValue) => {
    setSelectedFilters((prev) => {
      if (prev.includes(filterValue)) {
        return prev.filter((f) => f !== filterValue);
      } else {
        return [...prev, filterValue];
      }
    });
  };

  // Remove a specific filter
  const removeFilter = (filterValue) => {
    setSelectedFilters((prev) => prev.filter((f) => f !== filterValue));
  };

  // Use documents directly from API (filtering is done server-side)
  const filteredDocuments = allDocuments;

  function resetDates() {
    const { start, end } = getDefaultDates();
    setStartDate(start);
    setEndDate(end);
  }

  // Group documents by date
  const groupedDocuments = useMemo(() => {
    const groups = {};
    filteredDocuments?.forEach((doc) => {
      const d = new Date(doc.date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let label = "";
      if (d.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (d.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else {
        label = d.toLocaleDateString();
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(doc);
    });
    return groups;
  }, [filteredDocuments]);

  // Select all functionality
  const allDocIds = useMemo(() => {
    return new Set(filteredDocuments?.map((doc) => doc.id) || []);
  }, [filteredDocuments]);

  const isAllSelected = allDocIds.size > 0 && selectedDocIds.size === allDocIds.size;
  const isIndeterminate = selectedDocIds.size > 0 && selectedDocIds.size < allDocIds.size;

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedDocIds(new Set(allDocIds));
    } else {
      setSelectedDocIds(new Set());
    }
  };

  const handleSelectDoc = (docId, checked) => {
    const newSelected = new Set(selectedDocIds);
    if (checked) {
      newSelected.add(docId);
    } else {
      newSelected.delete(docId);
    }
    setSelectedDocIds(newSelected);
  };

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      dispatch(
        fetchMoreDocuments({
          startDate,
          endDate,
          page: page + 1,
          limit: 20,
          search: searchDebounced,
          isSeen: isSeenParam,
          category: categoryParam,
          filters: typeFilters,
        })
      );
    }
  }, [
    dispatch,
    hasMore,
    loadingMore,
    loading,
    startDate,
    endDate,
    page,
    searchDebounced,
    isSeenParam,
    categoryParam,
    typeFilters,
  ]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
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
  }, [handleLoadMore]);


  return (
    <div className="text-white h-full overflow-hidden flex flex-col p-4">


      {/* CHIP FILTER INPUT */}
      <div className="mb-5">
        {/* Selected Filters as Chips */}
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedFilters.map((filterValue) => {
              const filterLabel = Object.keys(FILTER_MAP).find(
                (key) => FILTER_MAP[key] === filterValue
              );
              return (
                <div
                  key={filterValue}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm"
                >
                  <span>{filterLabel}</span>
                  <button
                    onClick={() => removeFilter(filterValue)}
                    className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${filterLabel} filter`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter Options */}
        <div className="flex flex-wrap gap-3">
          {Object.keys(FILTER_MAP).map((item) => {
            const filterValue = FILTER_MAP[item];
            const isSelected = selectedFilters.includes(filterValue);
            return (
              <Button
                key={item}
                onClick={() => toggleFilter(filterValue)}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`rounded-full ${isSelected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-600 bg-white text-black"
                  }`}
              >
                {item}
              </Button>
            );
          })}
        </div>
      </div>

      {/* STATUS + CATEGORY FILTER ROW */}
      <div className="flex items-center gap-4 mb-4">

        {/* STATUS */}
        <span>Status:</span>
        <Button
          onClick={() => setStatusFilter("all")}
          variant={statusFilter === "all" ? "default" : "secondary"}
          size="sm"
        >
          All
        </Button>

        <Button
          onClick={() => setStatusFilter("unseen")}
          variant={statusFilter === "unseen" ? "default" : "secondary"}
          size="sm"
          className="flex items-center gap-2"
        >
          Unseen
        </Button>

        <Button
          onClick={() => setStatusFilter("seen")}
          variant={statusFilter === "seen" ? "default" : "secondary"}
          size="sm"
          className="flex items-center gap-2"
        >
          Seen
        </Button>

        {/* CATEGORY */}
        <span className="ml-6">Category:</span>

        {["C", "D", "F"].map((cat) => (
          <Button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            variant={categoryFilter === cat ? "default" : "secondary"}
            size="sm"
          >
            {cat}
          </Button>
        ))}

        {categoryFilter && (
          <Button
            onClick={() => setCategoryFilter(null)}
            variant="secondary"
            size="sm"
          >
            Reset
          </Button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1d232a]"
        />
      </div>
      <div className="flex gap-3 items-center mb-4 shrink-0">
        <span>Date Range:</span>

        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-[#1d232a]"
        />

        <span>to</span>

        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-[#1d232a]"
        />

        <Button
          onClick={resetDates}
          variant="secondary"
          size="sm"
          className="ml-3"
        >
          Reset
        </Button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 bg-[#161b22] p-4 rounded-lg border border-gray-700 overflow-hidden flex flex-col">

        {/* Date Filter (FIXED) */}


        {/* 📜 TABLE (ONLY THIS SCROLLS) */}
        <div className="flex-1 overflow-y-auto chat-list-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-[#161b22] z-10 border-b border-gray-700">
              <TableRow className="hover:bg-transparent border-gray-700">
                <TableHead className="w-14 h-12">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isAllSelected || isIndeterminate}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                    <span className="text-xs font-medium text-gray-400">Select All</span>
                  </div>
                </TableHead>
                <TableHead className="h-12 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="h-12 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Uploaded By
                </TableHead>
                <TableHead className="h-12 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date & Time
                </TableHead>
                <TableHead className="h-12 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="h-12 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Category
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <DocumentTableSkeleton rows={8} />
              ) : Object.keys(groupedDocuments).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <p className="text-sm font-medium">No documents found</p>
                      <p className="text-xs mt-1">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                Object.keys(groupedDocuments).map((group) => (
                  <>
                    {/* Group Header */}
                    <TableRow key={`group-${group}`} className="bg-[#0d1117] border-gray-800 hover:bg-[#0d1117]">
                      <TableCell colSpan={6} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                          <span className="text-sm font-semibold text-blue-400 px-3">
                            {group}
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Group Rows */}
                    {groupedDocuments[group].map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="border-gray-800 hover:bg-[#1d232a]/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedDoc(doc)}
                      >
                        <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedDocIds.has(doc.id)}
                            onCheckedChange={(checked) => handleSelectDoc(doc.id, checked)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${doc.driver_name}`}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${doc.seen === false
                                  ? "bg-blue-500"
                                  : doc.seen === true
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }`}
                            />
                            <span className="text-xs text-gray-400">
                              {doc.seen === false ? "Unseen" : doc.seen === true ? "Seen" : "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {doc.driver_image && (
                              <img
                                src={doc.driver_image}
                                alt={doc.driver_name}
                                className="w-8 h-8 rounded-full object-cover border border-gray-700"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <span className="text-sm font-medium text-white">
                              {doc.driver_name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="text-sm text-gray-300">
                            {new Date(doc.date).toLocaleString("en-US", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="text-sm text-gray-300">{doc.type || "—"}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-800/50 text-gray-300 border border-gray-700">
                            {doc.feature || "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))
              )}

              {/* Infinite Scroll Trigger */}
              {hasMore && !loading && (
                <TableRow>
                  <TableCell colSpan={6} ref={observerTarget} className="h-16">
                    {loadingMore && (
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-xs">Loading more documents...</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}

              {/* End of Results */}
              {!hasMore && !loading && filteredDocuments?.length > 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-12 text-center">
                    <p className="text-xs text-gray-500">No more documents to load</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {!loading && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <span>
                  Showing: <span className="font-semibold text-white">{filteredDocuments?.length || 0}</span> of{" "}
                  <span className="font-semibold text-white">{total || filteredDocuments?.length || 0}</span> documents
                </span>
                {selectedDocIds.size > 0 && (
                  <span>
                    Selected: <span className="font-semibold text-blue-400">{selectedDocIds.size}</span>
                  </span>
                )}
              </div>
              
            </div>
          )}
        </div>
      </div>

      {/* DRAWER FOR DOCUMENT PREVIEW */}
      <Drawer open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)} direction="right">
        <DrawerContent className="w-full sm:max-w-2xl h-full bg-[#161b22] border-gray-700">
          <DrawerHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl font-semibold text-white">
                Document Details
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            {selectedDoc && (
              <DrawerDescription className="text-sm text-gray-400">
                Preview and details for the selected document
              </DrawerDescription>
            )}
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-[#161b22]">
            {selectedDoc ? (
              <DocumentPreviewContent selectedDoc={selectedDoc} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-center">
                  No document selected
                </p>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
