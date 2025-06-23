import { useState, useRef, useCallback } from "react";
import axios from "axios";

export default function useProducts({ userId, limit = 5, products, setProducts }) {
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For infinite scroll
  const [hasMore, setHasMore] = useState(true); // If more data is available
  const [skip, setSkip] = useState(0); // Pagination offset

  const lastLoad = useRef(0); // Throttle control
  const ended = useRef(false); // Prevent duplicate fetches

  // Fetch products from server
  const fetchProducts = useCallback(
    async ({ query = "", category = "", reset = false, customSkip = 0 }) => {
      if (reset) setRefreshing(true);
      try {
        const { data } = await axios.get("https://reactnativeproject.onrender.com/adminfetchproducts", {
          params: {
            query: query.trim() || undefined,
            category: category || undefined,
            userId,
            skip: customSkip,
            limit,
          },
        });

        const fetched = Array.isArray(data?.data) ? data.data : [];

        // Merge and remove duplicates
        setProducts(prev => {
          const combined = reset ? fetched : [...prev, ...fetched];
          return Array.from(new Map(combined.map(p => [p._id, p])).values());
        });

        // Update skip & end state
        setSkip(prev => reset ? fetched.length : prev + fetched.length);
        const hasMoreData = fetched.length === limit;
        setHasMore(hasMoreData);
        ended.current = !hasMoreData;
      } catch (err) {
        console.error("Fetch error:", err?.response?.data || err.message);
      } finally {
        const MIN_SPINNER_TIME = 5000;
        const timeElapsed = Date.now() - lastLoad.current;
        const delay = Math.max(MIN_SPINNER_TIME - timeElapsed, 0);

        if (reset) {
          setTimeout(() => setRefreshing(false), delay);
          setIsLoadingMore(false);
        } else {
          setTimeout(() => setIsLoadingMore(false), delay);
        }
      }
    },
    [userId, limit, setProducts]
  );

  // Trigger when scrolling to bottom
  const loadMoreData = useCallback(
    ({ query = "", category = "" }) => {
      const now = Date.now();
      if (!hasMore || isLoadingMore || ended.current || now - lastLoad.current < 1000) return;
      lastLoad.current = now;
      setIsLoadingMore(true);
      fetchProducts({ query, category, customSkip: skip });
    },
    [hasMore, isLoadingMore, skip, fetchProducts]
  );

  // Pull-to-refresh logic
  const refreshList = useCallback(() => {
    setSkip(0);
    ended.current = false;
    fetchProducts({ reset: true });
  }, [fetchProducts]);

  return {
    products,
    setProducts,
    refreshing,
    isLoadingMore,
    hasMore,
    skip,
    fetchProducts,
    loadMoreData,
    refreshList,
  };
}
