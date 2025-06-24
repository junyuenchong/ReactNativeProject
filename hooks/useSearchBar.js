// hooks/useSearchBar.js
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function useSearchBar({ userId, selectedCategory, fetchProducts}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      Alert.alert("Search", "Please enter a search keyword.");
      return;
    }
    await fetchProducts({ query: searchQuery, category: selectedCategory ?? "", reset: true });
    await fetchRecommendedProduct();
    await getSearchHistory();
  };



  //fetchSearchProducinSearchMoodal
  const getSearchHistory = async () => {
    if (!userId) return; // Exit if userId is not available
  
    try {
      // Fetch user profile to get search history
      const res = await axios.get(`https://reactnativeproject.onrender.com/profile/${userId}`);
  
      // Extract search history or fallback to empty array
      const history = res.data?.user?.searchhistory ?? [];
  
      // Get the 5 most recent searches (reversed)
      const latest = history.slice().reverse().slice(0, 5);
  
      // Update state only if the new history differs from the old one
      setSearchHistory(prev =>
        JSON.stringify(prev) !== JSON.stringify(latest) ? latest : prev
      );
    } catch (err) {
      // Log error if request fails
      console.error("History fetch failed:", err.message);
    }
  };
  


  const fetchRecommendedProduct = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `https://reactnativeproject.onrender.com/fetch-recommeneded-products/${userId}`
      );
      setRecommended(res.data);
    } catch (err) {
      console.error("Error loading recommended products", err);
    }
  };



  // ⏱️ Pull-to-refresh logic (exported to HomeScreen)
  const onRefresh = useCallback(async () => {
    await fetchProducts({
      query: searchQuery,
      category: selectedCategory,
      reset: true,
    });
  }, [searchQuery, selectedCategory]);


  // 🔄 Refresh on screen focus or user change
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      const loadData = async () => {
        console.log("🔄 Loading data on screen focus for:", userId);
        await onRefresh();
      };

      loadData();
    }, [userId])
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getSearchHistory();
        await fetchRecommendedProduct();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userId]);

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    searchHistory,
    recommended,
    searchModalVisible,
    setSearchModalVisible,
    fetchRecommendedProduct,
    getSearchHistory,
    onRefresh,

  };
}
