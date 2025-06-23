// hooks/useProducts.js
import { useState, useRef, useCallback } from "react";
import axios from "axios";

export default function useProducts({ userId, limit = 5 , products,setProducts}) {
 
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);

  const lastLoadTime = useRef(0);
  const hasCalledEnd = useRef(false);

  const fetchProducts = useCallback(
    async ({ query = "", category = "", reset = false, customSkip = 0 }) => {
      try {
        if (reset) setRefreshing(true);

        const res = await axios.get(
          "https://reactnativeproject.onrender.com/fetchproducts",
          {
            params: {
              query: query.trim() || undefined,
              category: category || undefined,
              userId,
              skip: customSkip,
              limit,
            },
          }
        );

        const fetched = Array.isArray(res?.data?.data) ? res.data.data : [];

        if (reset) {
          setProducts(fetched);
          setSkip(fetched.length);
        } else {
          setProducts((prev) => [...prev, ...fetched]);
          setSkip((prev) => prev + fetched.length);
        }

        const moreAvailable = fetched.length === limit;
        setHasMore(moreAvailable);
        hasCalledEnd.current = !moreAvailable;
      } catch (err) {
        console.error("Fetch error:", err?.response?.data || err.message);
      } finally {
        if (reset) setRefreshing(false);
        setTimeout(() => {
          setIsLoadingMore(false);
        }, 100);
      }
    },
    [userId, limit]
  );

  const loadMoreData = useCallback(
    ({ query = "", category = "" }) => {
      const now = Date.now();
      if (!hasMore || isLoadingMore || hasCalledEnd.current) return;
      if (now - lastLoadTime.current < 3000) return;

      lastLoadTime.current = now;
      setIsLoadingMore(true);
      fetchProducts({ query, category, skip });
    },
    [hasMore, isLoadingMore, fetchProducts, skip]
  );

  const refreshList = useCallback(() => {
    setSkip(0);
    hasCalledEnd.current = false;
    fetchProducts({ reset: true });
  }, [fetchProducts]);

  return {
    products,
    setProducts,
    refreshing,
    hasMore,
    isLoadingMore,
    skip,
    fetchProducts,
    loadMoreData,
    refreshList,
  };
}
